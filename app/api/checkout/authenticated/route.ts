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

    // 7. Return order ID and order number in response
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
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
