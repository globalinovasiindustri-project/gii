/**
 * Shipping Service
 * Handles shipping cost calculation via RajaOngkir API
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

// RajaOngkir API response types
type RajaOngkirCostData = {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

type RajaOngkirResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  data: RajaOngkirCostData[] | null;
};

// Supported couriers (only JNE and J&T)
const SUPPORTED_COURIERS = ["jne", "jnt"];

/**
 * Shipping Service
 * Integrates with RajaOngkir API for real shipping cost calculation
 */
export const shippingService = {
  /**
   * Get available shipping options from RajaOngkir
   * Falls back to flat rate if API fails
   */
  async getShippingOptions(
    destinationRegencyCode: string,
    weightInGrams: number,
  ): Promise<ShippingOption[]> {
    if (!destinationRegencyCode) {
      throw new ValidationError(
        "Pilih kota/kabupaten untuk menghitung ongkos kirim",
      );
    }

    if (!weightInGrams || weightInGrams <= 0) {
      throw new ValidationError("Berat tidak valid");
    }

    // Check if RajaOngkir is configured
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    const originDistrictId = process.env.RAJAONGKIR_ORIGIN_DISTRICT_ID;
    const baseUrl = process.env.RAJAONGKIR_BASE_URL;

    if (!apiKey || !originDistrictId || !baseUrl) {
      console.warn(
        "RajaOngkir not configured, using fallback flat rate shipping",
      );
      return this.getFallbackShippingOptions(weightInGrams);
    }

    try {
      // Call RajaOngkir API for each courier
      const shippingOptions: ShippingOption[] = [];

      for (const courier of SUPPORTED_COURIERS) {
        try {
          const formData = new URLSearchParams({
            origin: originDistrictId,
            destination: destinationRegencyCode,
            weight: weightInGrams.toString(),
            courier: courier,
          });

          // API key in header as 'key' (not 'x-api-key')
          const response = await fetch(`${baseUrl}/calculate/domestic-cost`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              key: apiKey,
            },
            body: formData.toString(),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.warn(
              `RajaOngkir API failed for ${courier}: ${response.status}`,
            );
            console.warn(`Response: ${errorText.substring(0, 200)}`);
            continue;
          }

          const result: RajaOngkirResponse = await response.json();

          if (
            result.meta.status !== "success" ||
            !result.data ||
            result.data.length === 0
          ) {
            console.warn(`No shipping data for ${courier}`);
            continue;
          }

          // Parse each service option from the courier
          for (const serviceData of result.data) {
            shippingOptions.push({
              courierId: serviceData.code.toLowerCase(),
              courierName: serviceData.name,
              serviceCode: serviceData.service,
              serviceName: serviceData.description,
              cost: serviceData.cost,
              etd: serviceData.etd || "Estimasi tidak tersedia",
            });
          }
        } catch (courierError) {
          console.warn(`Error fetching ${courier}:`, courierError);
          continue;
        }
      }

      // If we got results, return them
      if (shippingOptions.length > 0) {
        // Sort by cost (cheapest first)
        return shippingOptions.sort((a, b) => a.cost - b.cost);
      }

      // Fallback if no results
      console.warn("No shipping options from RajaOngkir, using fallback");
      return this.getFallbackShippingOptions(weightInGrams);
    } catch (error) {
      console.error("RajaOngkir API error:", error);
      return this.getFallbackShippingOptions(weightInGrams);
    }
  },

  /**
   * Fallback flat rate shipping options
   * Used when RajaOngkir API is unavailable
   */
  getFallbackShippingOptions(weightInGrams: number): ShippingOption[] {
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
