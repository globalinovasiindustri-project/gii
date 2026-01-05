import { NextRequest, NextResponse } from "next/server";
import { shippingService } from "@/lib/services/shipping.service";
import { formatErrorResponse, ValidationError } from "@/lib/errors";
import { z, ZodError } from "zod";

// Validation schema for shipping calculation
const calculateShippingSchema = z.object({
  destinationRegencyCode: z.string().min(1, "Kode kota/kabupaten diperlukan"),
  weightInGrams: z.number().positive("Berat harus lebih dari 0"),
});

/**
 * POST /api/shipping/calculate
 * Calculate shipping costs for a destination regency and weight
 * Accessible to both authenticated and guest users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validated = calculateShippingSchema.parse(body);

    // Calculate shipping costs via service
    const shippingOptions = await shippingService.getShippingOptions(
      validated.destinationRegencyCode,
      validated.weightInGrams
    );

    return NextResponse.json(
      {
        success: true,
        message: "Shipping options calculated successfully",
        data: shippingOptions,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors specifically
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      const validationError = new ValidationError(
        firstError?.message || "Validation failed"
      );
      const { response, statusCode } = formatErrorResponse(validationError);
      return NextResponse.json(response, { status: statusCode });
    }

    const { response, statusCode } = formatErrorResponse(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
