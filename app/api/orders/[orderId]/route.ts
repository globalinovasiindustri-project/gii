import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";

/**
 * GET /api/orders/[orderId]
 * Get single order by ID
 * User can only access their own orders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError("Anda harus login untuk melihat pesanan");
    }

    const { orderId } = await params;

    // Fetch order
    const order = await orderService.getOrderById(orderId, "user");

    if (!order) {
      throw new NotFoundError("Pesanan tidak ditemukan");
    }

    // Verify ownership
    if (order.order.userId !== userId) {
      throw new AuthorizationError("Anda tidak memiliki akses ke pesanan ini");
    }

    return NextResponse.json(
      {
        success: true,
        data: order.order,
        orderItems: order.orderItems,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
