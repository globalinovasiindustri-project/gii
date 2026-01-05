"use client";

import { useMutation } from "@tanstack/react-query";

// Types matching the shipping service
export type ShippingOption = {
  courierId: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  cost: number;
  etd: string; // e.g., "1-2 Hari"
};

// API request type
export type CalculateShippingParams = {
  destinationRegencyCode: string;
  weightInGrams: number;
};

// API response type
export type ShippingResponse = {
  success: boolean;
  message: string;
  data: ShippingOption[];
};

/**
 * Shipping API object
 * Contains all shipping-related API methods
 */
export const shippingApi = {
  /**
   * Calculate shipping costs for a destination regency and weight
   */
  calculateShipping: async (
    params: CalculateShippingParams
  ): Promise<ShippingResponse> => {
    const response = await fetch("/api/shipping/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal menghitung ongkos kirim");
    }

    return response.json();
  },
};

/**
 * Hook to calculate shipping costs
 * Returns a mutation that can be triggered with destination regency code and weight
 */
export function useCalculateShipping() {
  return useMutation({
    mutationFn: async (params: CalculateShippingParams) => {
      const response = await shippingApi.calculateShipping(params);
      return response.data;
    },
  });
}
