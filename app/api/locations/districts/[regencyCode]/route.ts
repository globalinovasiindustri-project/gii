import { NextRequest, NextResponse } from "next/server";
import { locationService } from "@/lib/services/location.service";
import { formatErrorResponse, ValidationError } from "@/lib/errors";

type RouteParams = {
  params: Promise<{ regencyCode: string }>;
};

/**
 * GET /api/locations/districts/[regencyCode]
 * Returns districts (kecamatan) within a regency from wilayah.id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { regencyCode } = await params;

    if (!regencyCode) {
      throw new ValidationError("Kode kota/kabupaten tidak valid");
    }

    const districts = await locationService.getDistricts(regencyCode);

    return NextResponse.json(
      {
        success: true,
        message: "Districts retrieved successfully",
        data: districts,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
