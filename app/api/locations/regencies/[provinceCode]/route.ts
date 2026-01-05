import { NextRequest, NextResponse } from "next/server";
import { locationService } from "@/lib/services/location.service";
import { formatErrorResponse, ValidationError } from "@/lib/errors";

type RouteParams = {
  params: Promise<{ provinceCode: string }>;
};

/**
 * GET /api/locations/regencies/[provinceCode]
 * Returns regencies (kota/kabupaten) within a province from wilayah.id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { provinceCode } = await params;

    if (!provinceCode) {
      throw new ValidationError("Kode provinsi tidak valid");
    }

    const regencies = await locationService.getRegencies(provinceCode);

    return NextResponse.json(
      {
        success: true,
        message: "Regencies retrieved successfully",
        data: regencies,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
