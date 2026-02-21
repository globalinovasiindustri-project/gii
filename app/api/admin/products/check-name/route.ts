import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { productGroups } from "@/lib/db/schema";
import { eq, and, not } from "drizzle-orm";
import { decodeUserId } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const userId = decodeUserId(request);
    if (!userId) throw new AuthorizationError("Unauthorized");

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const excludeId = searchParams.get("excludeId"); // For edit mode

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    // Check if product group with this name exists
    const conditions = excludeId
      ? and(eq(productGroups.name, name), not(eq(productGroups.id, excludeId)))
      : eq(productGroups.name, name);

    const existing = await db
      .select({ id: productGroups.id })
      .from(productGroups)
      .where(conditions)
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        exists: existing.length > 0,
        message:
          existing.length > 0
            ? `Produk dengan nama "${name}" sudah ada`
            : "Nama produk tersedia",
      },
    });
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
