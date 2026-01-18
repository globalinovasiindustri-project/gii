import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { paymentService } from "@/lib/services/payment.service";
import {
  formatErrorResponse,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

/**
 * POST /api/payment/retry
 * Retry payment for an existing order
 *
 * This endpoint generates a new Snap token with a timestamped Midtrans order ID
 * allowing customers to retry payment if they cancelled or encountered issues
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      throw new ValidationError("Order ID is required");
    }

    // Fetch order details
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundError("Order tidak ditemukan");
    }

    // Only allow retry for pending/unpaid orders
    if (order.paymentStatus === "paid") {
      throw new ValidationError("Order sudah dibayar");
    }

    if (order.orderStatus === "cancelled") {
      throw new ValidationError("Order sudah dibatalkan");
    }

    // Parse shipping address to get customer details
    const shippingAddress = JSON.parse(order.shippingAddress);
    const nameParts = order.customerName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Parse order items from database
    const { orderItems } = await import("@/lib/db/schema");
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    // Prepare item details for Midtrans
    const itemDetails = items.map((item) => ({
      id: item.productId || item.productSku,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
    }));

    // Add shipping cost as item
    if (order.shippingCost > 0) {
      itemDetails.push({
        id: "shipping",
        name: "Ongkos Kirim",
        price: order.shippingCost,
        quantity: 1,
      });
    }

    // Generate new Snap token with timestamped order ID
    const paymentToken = await paymentService.createSnapToken({
      orderId: order.id,
      orderNumber: order.orderNumber,
      grossAmount: order.total,
      customerDetails: {
        firstName,
        lastName,
        email: order.customerEmail,
        phone: shippingAddress.phone || "",
      },
      itemDetails,
    });

    // Update order with new Midtrans order ID and Snap token
    await db
      .update(orders)
      .set({
        midtransOrderId: paymentToken.midtransOrderId,
        snapToken: paymentToken.token,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    return NextResponse.json(
      {
        success: true,
        message: "Token pembayaran berhasil dibuat",
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentUrl: paymentToken.redirectUrl,
          snapToken: paymentToken.token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
