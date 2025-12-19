import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { formatErrorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productGroupId: string }> }
) {
  try {
    const { productGroupId } = await params;

    const combinations =
      await productService.getValidVariantCombinations(productGroupId);

    return NextResponse.json({
      success: true,
      data: combinations,
    });
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
