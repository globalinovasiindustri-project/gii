import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/order.service";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { z } from "zod";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

// Simple validation schema for admin notes
const updateAdminNotesSchema = z.object({
  adminNotes: z.string(),
});

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

    // 2. Validate request body
    const body = await request.json();
    const validated = updateAdminNotesSchema.parse(body);

    // 3. Call orderService.updateAdminNotes
    const updatedOrder = await orderService.updateAdminNotes(
      orderId,
      validated.adminNotes
    );

    // 4. Return updated order data
    return NextResponse.json(
      {
        success: true,
        message: "Catatan admin berhasil disimpan",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
