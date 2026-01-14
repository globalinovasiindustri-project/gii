import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import { formatErrorResponse, ValidationError } from "@/lib/errors";

/**
 * GET /api/orders/my-orders
 * Fetch all orders for the authenticated user
 * Returns orders with order items and product details, sorted by creation date (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    // Decode userId from auth token
    const userId = decodeUserId(request);

    // Validate user is authenticated
    if (!userId) {
      throw new ValidationError("Tidak terautentikasi");
    }

    // Fetch orders for the authenticated user
    const completeOrders = await orderService.getUserOrders(userId);

    // Transform the response to match frontend expectations
    const formattedOrders = completeOrders.map((completeOrder) => ({
      ...completeOrder.order,
      orderItems: completeOrder.orderItems.map((item) => ({
        ...item.orderItem,
        // Parse variantSelections from JSON string
        variantSelections: item.orderItem.variantSelections
          ? JSON.parse(item.orderItem.variantSelections)
          : null,
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil diambil",
        data: formattedOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors with appropriate messages
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
