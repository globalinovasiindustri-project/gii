import { NextRequest, NextResponse } from "next/server";
import { locationService } from "@/lib/services/location.service";
import { formatErrorResponse, ValidationError } from "@/lib/errors";

type RouteParams = {
  params: Promise<{ districtCode: string }>;
};

/**
 * GET /api/locations/villages/[districtCode]
 * Returns villages (kelurahan/desa) within a district from wilayah.id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { districtCode } = await params;

    if (!districtCode) {
      throw new ValidationError("Kode kecamatan tidak valid");
    }

    const villages = await locationService.getVillages(districtCode);

    return NextResponse.json(
      {
        success: true,
        message: "Villages retrieved successfully",
        data: villages,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
