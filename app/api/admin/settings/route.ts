import { NextRequest, NextResponse } from "next/server";
import { appConfigService } from "@/lib/services/app-config.service";
import { settingsSchema } from "@/lib/validations/settings.validation";
import { decodeUserId } from "@/lib/utils/token.utils";
import { formatErrorResponse, AuthorizationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const userId = decodeUserId(request);
    if (!userId) throw new AuthorizationError("Unauthorized");

    const config = await appConfigService.getConfig();

    if (!config) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const response = {
      ...config,
      heroImages: config.heroImages ? JSON.parse(config.heroImages) : [],
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = decodeUserId(request);
    if (!userId) throw new AuthorizationError("Unauthorized");

    const body = await request.json();
    const validated = settingsSchema.parse(body);

    const result = await appConfigService.upsertConfig(validated);

    return NextResponse.json(
      {
        success: true,
        message: "Pengaturan berhasil disimpan",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
