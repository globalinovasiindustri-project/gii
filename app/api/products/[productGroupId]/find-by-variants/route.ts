import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/product.service";
import { formatErrorResponse } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productGroupId: string }> }
) {
  try {
    const { productGroupId } = await params;
    const body = await request.json();
    const { variantSelections } = body;

    if (!variantSelections || typeof variantSelections !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid variant selections",
        },
        { status: 400 }
      );
    }

    const product = await productService.findProductByVariants(
      productGroupId,
      variantSelections
    );

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
