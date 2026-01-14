import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { userService } from "@/lib/services/user.service";
import { decodeUserId } from "@/lib/utils/token.utils";
import {
  formatErrorResponse,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const userId = decodeUserId(request);
    if (!userId) {
      throw new AuthorizationError("Unauthorized");
    }

    // 2. Get form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      throw new ValidationError("File tidak ditemukan");
    }

    // 3. Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new ValidationError(
        "Format file tidak didukung. Gunakan JPG, PNG, atau WebP."
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("Ukuran file maksimal 15MB.");
    }

    // 5. Upload to Vercel Blob
    const fileName = `avatars/${userId}-${Date.now()}.${file.type.split("/")[1]}`;
    const blob = await put(fileName, file, {
      access: "public",
    });

    // 6. Update user avatar in database
    const updatedUser = await userService.updateAvatar(userId, blob.url);

    if (!updatedUser) {
      throw new AuthorizationError("User not found");
    }

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Foto profil berhasil diperbarui",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
