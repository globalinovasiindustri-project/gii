import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * POST /api/payment/notification
 * Handle Midtrans payment notification webhook
 *
 * This endpoint receives payment status updates from Midtrans
 * and updates the order accordingly
 */
export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();

    // Verify notification signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const midtransOrderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;

    // Create hash for verification
    const hash = crypto
      .createHash("sha512")
      .update(`${midtransOrderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    // Verify signature
    if (hash !== signatureKey) {
      console.error("Invalid signature for notification:", notification);
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 403 }
      );
    }

    // Get transaction status
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log("Payment notification received:", {
      midtransOrderId,
      transactionStatus,
      fraudStatus,
    });

    // Find order by Midtrans order ID
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.midtransOrderId, midtransOrderId))
      .limit(1);

    if (!order) {
      console.error("Order not found for Midtrans order ID:", midtransOrderId);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Determine order status based on transaction status
    let orderStatus = order.orderStatus;
    let paymentStatus = order.paymentStatus;

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        // Payment captured and verified
        paymentStatus = "paid";
        orderStatus = "processing";
      }
    } else if (transactionStatus === "settlement") {
      // Payment settled
      paymentStatus = "paid";
      orderStatus = "processing";
    } else if (transactionStatus === "pending") {
      // Payment pending
      paymentStatus = "pending";
      orderStatus = "pending";
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "expire" ||
      transactionStatus === "cancel"
    ) {
      // Payment failed/cancelled
      paymentStatus = "failed";
      orderStatus = "cancelled";
    }

    // Update order status
    await db
      .update(orders)
      .set({
        paymentStatus,
        orderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    console.log("Order updated:", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      midtransOrderId,
      paymentStatus,
      orderStatus,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification processed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment notification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
