import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";
import { profileFormSchema } from "@/lib/validations/auth.validation";

// ==================== Route Handler ====================
export async function GET(request: NextRequest) {
  try {
    // Get token from request header
    const userId = decodeUserId(request);
    // If token is not present, return unauthorized response
    if (!userId) {
      throw new AuthorizationError("Unauthorized");
    }
    // Get user from database
    const user = await userService.getUserById(userId);
    // If user is not found, return not found response
    if (!user) {
      throw new AuthorizationError("User not found");
    }
    // Return user data with status 200
    return NextResponse.json(
      {
        success: true,
        message: "User data retrieved successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    // Return formatted error response with status code
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

// PATCH - Update user profile (Requirement 4.3, 4.4, 4.6, 4.7)
export async function PATCH(request: NextRequest) {
  try {
    // Get token from request header
    const userId = decodeUserId(request);
    // If token is not present, return unauthorized response
    if (!userId) {
      throw new AuthorizationError("Unauthorized");
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = profileFormSchema.parse(body);

    // Update user profile (only name and phone, email is read-only)
    const updatedUser = await userService.updateProfile(userId, {
      name: validated.name,
      phone: validated.phone,
    });

    // If user is not found, return not found response
    if (!updatedUser) {
      throw new AuthorizationError("User not found");
    }

    // Return updated user data with status 200
    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil diperbarui",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    // Return formatted error response with status code
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
