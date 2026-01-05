import { NextResponse } from "next/server";
import { locationService } from "@/lib/services/location.service";
import { formatErrorResponse } from "@/lib/errors";

/**
 * GET /api/locations/provinces
 * Returns all Indonesian provinces from wilayah.id
 */
export async function GET() {
  try {
    const provinces = await locationService.getProvinces();

    return NextResponse.json(
      {
        success: true,
        message: "Provinces retrieved successfully",
        data: provinces,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
