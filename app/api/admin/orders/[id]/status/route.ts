import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { updateOrderStatusSchema } from "@/lib/validations/order.validation";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth check - verify admin role
    const viewerRole = decodeUserRole(request);
    if (!viewerRole || !["admin", "super_admin"].includes(viewerRole)) {
      throw new AuthorizationError("Unauthorized");
    }

    const { id: orderId } = await params;

    // 2. Validate request body with Zod schema
    const body = await request.json();
    const validated = updateOrderStatusSchema.parse(body);

    // 3. Call orderService.updateStatus
    const updatedOrder = await orderService.updateStatus(orderId, validated);

    // 4. Return updated order data
    return NextResponse.json(
      {
        success: true,
        message: "Status order berhasil diupdate",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
