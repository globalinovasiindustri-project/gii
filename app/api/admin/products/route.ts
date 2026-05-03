import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { productService } from "@/lib/services/product.service";
import { ProductFilters } from "@/hooks/use-products";
import { decodeUserRole } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";
import { productSchema } from "@/lib/validations/product.validation";

// ==================== Request Parsers ====================
function parseProductFilters(searchParams: URLSearchParams): ProductFilters {
  const isActiveParam = searchParams.get("isActive");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const sortByParam = searchParams.get("sortBy");

  return {
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    search: searchParams.get("search") || undefined,
    page: parseInt(searchParams.get("page") || "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
    limit: parseInt(searchParams.get("limit") || "12", 10),
    isActive: isActiveParam ? isActiveParam === "true" : undefined,
    minPrice: minPriceParam ? parseInt(minPriceParam, 10) : undefined,
    maxPrice: maxPriceParam ? parseInt(maxPriceParam, 10) : undefined,
    sortBy: (sortByParam as ProductFilters["sortBy"]) || undefined,
  };
}

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);
    const { searchParams } = new URL(request.url);
    const filters = parseProductFilters(searchParams);

    const result = await productService.getProductGroups(filters, viewerRole);

    console.log(
      {
        success: true,
        message: "Product groups retrieved successfully",
        data: result.products,
        pagination: {
          totalCount: result.totalCount,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
      { status: 200 },
    );
    return NextResponse.json(
      {
        success: true,
        message: "Product groups retrieved successfully",
        data: result.products,
        pagination: {
          totalCount: result.totalCount,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);
    // Check admin permission
    if (!viewerRole || !["admin", "super_admin"].includes(viewerRole)) {
      throw new AuthorizationError("Unauthorized");
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Call service method - all business logic is in service
    const result = await productService.createCompleteProduct(validatedData);

    // Revalidate shop listing to show new product
    revalidatePath("/shop");
    revalidatePath(`/product/${result.productGroup.slug}`);
    revalidatePath("/"); // Revalidate homepage to show in "Terbaru" section

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
