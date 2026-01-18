import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { cartService } from "@/lib/services/cart.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";

interface AuthenticatedCheckoutRequest {
  addressId: string;
  // Shipping selection (optional for backward compatibility)
  selectedCourier?: string;
  selectedService?: string;
  shippingCost?: number;
}

/**
 * POST /api/checkout/authenticated
 * Create order for authenticated user with selected address
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError("Anda harus login untuk checkout");
    }

    // 2. Validate addressId is provided
    const body: AuthenticatedCheckoutRequest = await request.json();
    if (!body.addressId) {
      throw new ValidationError("Address ID is required");
    }

    // 3. Fetch cart items for authenticated user
    const cartItems = await cartService.getCartByUserId(userId);

    // 4. Validate cart is not empty
    if (cartItems.length === 0) {
      throw new ValidationError("Keranjang kosong");
    }

    // 5. Validate cart items availability and stock
    const validation = await cartService.validateCart(cartItems);
    if (!validation.valid) {
      // Format validation errors for response
      const errorMessages = validation.errors.map((err) => err.message);
      throw new ValidationError("Cart validation failed", {
        errors: validation.errors,
        messages: errorMessages,
      });
    }

    // 6. Call orderService.createAuthenticatedOrder with shipping data
    const result = await orderService.createAuthenticatedOrder({
      userId,
      addressId: body.addressId,
      cartItems,
      selectedCourier: body.selectedCourier,
      selectedService: body.selectedService,
      shippingCost: body.shippingCost,
    });

    // 7. Generate Midtrans payment token
    const { paymentService } = await import("@/lib/services/payment.service");

    // Get user details for payment
    const { db } = await import("@/lib/db/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const nameParts = user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const itemDetails = cartItems.map((item) => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // Add shipping as item
    const shippingCost = body.shippingCost ?? 15000;
    if (shippingCost > 0) {
      itemDetails.push({
        id: "shipping",
        name: "Ongkos Kirim",
        price: shippingCost,
        quantity: 1,
      });
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal + shippingCost;

    const paymentToken = await paymentService.createSnapToken({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      grossAmount: total,
      customerDetails: {
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || "",
      },
      itemDetails,
    });

    // 8. Store Midtrans order ID and Snap token in order for payment retry support
    const { orders } = await import("@/lib/db/schema");
    await db
      .update(orders)
      .set({
        midtransOrderId: paymentToken.midtransOrderId,
        snapToken: paymentToken.token,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, result.orderId));

    // 9. Return order ID, order number, and payment URL in response
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          paymentUrl: paymentToken.redirectUrl,
          snapToken: paymentToken.token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // 8. Handle errors with appropriate status codes and messages
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
