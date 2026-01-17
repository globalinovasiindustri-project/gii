import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import { UserFilters } from "@/hooks/use-users";
import { decodeUserRole, decodeUserId } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";
import { userSchema } from "@/lib/validations/user.validation";

// ==================== Request Parsers ====================
function parseUserFilters(searchParams: URLSearchParams): UserFilters {
  const isActiveParam = searchParams.get("isActive");

  return {
    status: searchParams.get("status") || undefined,
    role:
      (searchParams.get("role") as "user" | "admin" | "super_admin" | "") ||
      undefined,
    search: searchParams.get("search") || undefined,
    page: parseInt(searchParams.get("page") || "1", 10),
    pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
    isActive: isActiveParam ? isActiveParam === "true" : undefined,
  };
}

// ==================== Route Handlers ====================
export async function GET(request: NextRequest) {
  try {
    const viewerRole = decodeUserRole(request);
    const { searchParams } = new URL(request.url);
    const filters = parseUserFilters(searchParams);

    const result = await userService.getUsers({
      page: filters.page,
      search: filters.search,
      role: filters.role as "user" | "admin" | "super_admin" | undefined,
      isActive: filters.isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Users retrieved successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check - only admins can create users
    const userId = decodeUserId(request);
    if (!userId) throw new AuthorizationError("Unauthorized");

    const userRole = decodeUserRole(request);
    if (userRole !== "admin" && userRole !== "super_admin") {
      throw new AuthorizationError("Only admins can create users");
    }

    // 2. Validate input
    const body = await request.json();
    const validated = userSchema.parse(body);

    // 3. Delegate to service
    const result = await userService.createUser(validated);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.user,
      },
      { status: 201 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
