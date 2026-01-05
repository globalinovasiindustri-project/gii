/**
 * Shipping Service
 * Handles shipping cost calculation
 * Note: Location data is now fetched from wilayah.id via location.service.ts
 */

import { ValidationError } from "@/lib/errors";

// Types
export type ShippingOption = {
  courierId: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  cost: number;
  etd: string; // e.g., "1-2 Hari"
};

/**
 * Shipping Service
 * Currently provides placeholder for shipping cost calculation
 * Can be extended to integrate with shipping providers
 */
export const shippingService = {
  /**
   * Get available shipping options
   * Returns flat rate shipping options for now
   */
  async getShippingOptions(
    destinationRegencyCode: string,
    weightInGrams: number
  ): Promise<ShippingOption[]> {
    if (!destinationRegencyCode) {
      throw new ValidationError(
        "Pilih kota/kabupaten untuk menghitung ongkos kirim"
      );
    }

    if (!weightInGrams || weightInGrams <= 0) {
      throw new ValidationError("Berat tidak valid");
    }

    // Flat rate shipping options
    // Can be replaced with actual shipping provider integration
    const baseOptions: ShippingOption[] = [
      {
        courierId: "jne",
        courierName: "JNE",
        serviceCode: "REG",
        serviceName: "Reguler",
        cost: 15000,
        etd: "2-3 Hari",
      },
      {
        courierId: "jne",
        courierName: "JNE",
        serviceCode: "YES",
        serviceName: "Yakin Esok Sampai",
        cost: 25000,
        etd: "1 Hari",
      },
      {
        courierId: "sicepat",
        courierName: "SiCepat",
        serviceCode: "REG",
        serviceName: "Reguler",
        cost: 12000,
        etd: "2-3 Hari",
      },
      {
        courierId: "sicepat",
        courierName: "SiCepat",
        serviceCode: "BEST",
        serviceName: "Besok Sampai Tujuan",
        cost: 22000,
        etd: "1 Hari",
      },
      {
        courierId: "jnt",
        courierName: "J&T Express",
        serviceCode: "EZ",
        serviceName: "Express",
        cost: 14000,
        etd: "2-3 Hari",
      },
    ];

    // Adjust cost based on weight (simple calculation)
    const weightMultiplier = Math.ceil(weightInGrams / 1000);

    return baseOptions.map((option) => ({
      ...option,
      cost: option.cost * weightMultiplier,
    }));
  },
};
