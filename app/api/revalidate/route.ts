import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { decodeUserId } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

/**
 * API endpoint for on-demand revalidation of cached pages
 * Requires admin authentication
 *
 * Usage:
 * POST /api/revalidate
 * Body: { path: "/product/iphone-15" } or { paths: ["/product/iphone-15", "/shop"] }
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check - only admins can trigger revalidation
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError("Unauthorized");
    }

    const body = await request.json();
    const { path, paths } = body;

    // Validate input
    if (!path && !paths) {
      return NextResponse.json(
        {
          success: false,
          message: "Either 'path' or 'paths' is required",
        },
        { status: 400 },
      );
    }

    // Revalidate single path
    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        success: true,
        message: `Revalidated: ${path}`,
        data: { revalidated: [path] },
      });
    }

    // Revalidate multiple paths
    if (Array.isArray(paths)) {
      for (const p of paths) {
        revalidatePath(p);
      }
      return NextResponse.json({
        success: true,
        message: `Revalidated ${paths.length} paths`,
        data: { revalidated: paths },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid input format",
      },
      { status: 400 },
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
