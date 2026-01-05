import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { cartService } from "@/lib/services/cart.service";
import { getSessionId } from "@/lib/utils/session.utils";
import { formatErrorResponse, ValidationError } from "@/lib/errors";
import { guestCheckoutWithShippingSchema } from "@/lib/validations/checkout.validation";
import jwt from "jsonwebtoken";

/**
 * POST /api/checkout/guest
 * Process guest checkout: validate cart, create order, auto-register user, set auth cookie
 *
 * Request body:
 * - fullName: Customer full name
 * - email: Customer email
 * - phone: Customer phone number
 * - addressLabel: Address type (Rumah, Kantor, etc.)
 * - fullAddress: Street address
 * - village: Kelurahan
 * - district: Kecamatan
 * - city: City name
 * - province: Province name
 * - postalCode: 5-digit postal code
 * - provinceCode?: wilayah.id province code (optional)
 * - regencyCode?: wilayah.id regency code (optional)
 * - districtCode?: wilayah.id district code (optional)
 * - villageCode?: wilayah.id village code (optional)
 * - selectedCourier?: Selected courier name (optional)
 * - selectedService?: Selected service type (optional)
 * - shippingCost?: Calculated shipping cost (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = guestCheckoutWithShippingSchema.parse(body);

    // Validate session ID exists
    const sessionId = getSessionId(request);
    if (!sessionId) {
      throw new ValidationError("Session tidak ditemukan");
    }

    // Validate session has an associated cart in database
    const hasCart = await cartService.validateSession(sessionId);
    if (!hasCart) {
      throw new ValidationError("Keranjang tidak ditemukan untuk session ini");
    }

    // Fetch cart items from cart service
    const cartItems = await cartService.getCart(sessionId);

    // Validate cart is not empty
    if (cartItems.length === 0) {
      throw new ValidationError("Keranjang kosong");
    }

    // Validate cart items availability
    const validation = await cartService.validateCart(cartItems);
    if (!validation.valid) {
      // Build detailed error message for validation failures
      const errorMessages = validation.errors.map((error) => {
        if (error.type === "PRODUCT_UNAVAILABLE") {
          return `${error.message}`;
        } else if (error.type === "OUT_OF_STOCK") {
          return `${error.message}`;
        } else if (error.type === "PRICE_CHANGED") {
          return `${error.message}`;
        }
        return error.message;
      });

      throw new ValidationError(
        `Validasi keranjang gagal: ${errorMessages.join(", ")}`,
        { errors: validation.errors }
      );
    }

    // Call order service to create order with shipping and location data
    const result = await orderService.createGuestOrder({
      customerEmail: validated.email,
      customerName: validated.fullName,
      customerPhone: validated.phone,
      addressLabel: validated.addressLabel,
      fullAddress: validated.fullAddress,
      village: validated.village,
      district: validated.district,
      city: validated.city,
      province: validated.province,
      postalCode: validated.postalCode,
      // wilayah.id location codes for address persistence
      provinceCode: validated.provinceCode,
      regencyCode: validated.regencyCode,
      districtCode: validated.districtCode,
      villageCode: validated.villageCode,
      // Shipping selection
      selectedCourier: validated.selectedCourier,
      selectedService: validated.selectedService,
      shippingCost: validated.shippingCost,
      cartItems,
      sessionId,
    });

    // Generate auth token for new user
    const token = jwt.sign(
      {
        userId: result.userId,
        email: validated.email,
        role: "user",
        isActive: true,
        isDeleted: false,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30d",
      }
    );

    // Create response with order data
    const response = NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil dibuat",
        data: {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only auth cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    // Handle validation errors with appropriate messages
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
