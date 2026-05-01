import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { productService } from "@/lib/services/product.service";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";
import { productSchema } from "@/lib/validations/product.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewerRole = decodeUserRole(request);

    // Fetch all products and filter by ID
    const result = await productService.getProductGroups(
      { page: 1, limit: 1000 },
      viewerRole,
    );

    const { id } = await params;
    // Find the specific product by ID
    const product = result.products.find((p) => p.productGroup.id === id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
          data: null,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product retrieved successfully",
        data: product,
      },
      { status: 200 },
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const viewerRole = decodeUserRole(request);

    // Check admin permission
    if (!viewerRole || !["admin", "super_admin"].includes(viewerRole)) {
      throw new AuthorizationError("Unauthorized");
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const { id } = await params;
    // Call service method - all business logic is in service
    const result = await productService.updateCompleteProduct(
      id,
      validatedData,
    );

    // Revalidate product page and shop listing instantly
    revalidatePath(`/product/${result.productGroup.slug}`);
    revalidatePath("/shop");

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
