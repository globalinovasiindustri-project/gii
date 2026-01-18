"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface GuestCheckoutData {
  fullName: string;
  email: string;
  phone: string;
  address: {
    addressLabel: string;
    streetAddress: string;
    village: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    // wilayah.id location codes
    provinceCode?: string;
    regencyCode?: string;
    districtCode?: string;
    villageCode?: string;
  };
  // Shipping selection
  selectedCourier?: string;
  selectedService?: string;
  shippingCost?: number;
}

// Response interface for successful checkout
export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    paymentUrl?: string;
  };
}

// Error interface for checkout failures
export interface CheckoutError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Checkout API object
 * Contains all checkout-related API methods
 */
export const checkoutApi = {
  /**
   * Guest checkout API call
   * Makes a POST request to create an order for a guest user
   *
   * @param data - Guest checkout data including contact and address information
   * @returns Promise resolving to CheckoutResponse
   * @throws Error if the request fails
   */
  guestCheckout: async (data: GuestCheckoutData): Promise<CheckoutResponse> => {
    const response = await fetch("/api/checkout/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        addressLabel: data.address.addressLabel,
        fullAddress: data.address.streetAddress,
        village: data.address.village,
        district: data.address.district,
        city: data.address.city,
        province: data.address.state,
        postalCode: data.address.postalCode,
        // wilayah.id location codes
        provinceCode: data.address.provinceCode,
        regencyCode: data.address.regencyCode,
        districtCode: data.address.districtCode,
        villageCode: data.address.villageCode,
        // Shipping selection
        selectedCourier: data.selectedCourier,
        selectedService: data.selectedService,
        shippingCost: data.shippingCost,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Checkout failed");
    }

    return result;
  },

  /**
   * Authenticated checkout API call
   * Makes a POST request to create an order for an authenticated user
   *
   * @param addressId - ID of the selected shipping address
   * @param shippingData - Optional shipping selection data
   * @returns Promise resolving to CheckoutResponse
   * @throws Error if the request fails
   */
  authenticatedCheckout: async (
    addressId: string,
    shippingData?: {
      selectedCourier?: string;
      selectedService?: string;
      shippingCost?: number;
    }
  ): Promise<CheckoutResponse> => {
    const response = await fetch("/api/checkout/authenticated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        addressId,
        ...shippingData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Checkout failed");
    }

    return result;
  },
};

/**
 * Guest checkout mutation hook
 * Handles guest checkout with automatic cart invalidation and navigation
 */
export function useGuestCheckout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: GuestCheckoutData) => checkoutApi.guestCheckout(data),
    onSuccess: (result) => {
      // Invalidate cart to clear it after successful checkout
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      toast.success("Pesanan berhasil dibuat!");

      // Open payment in new tab
      if (result.data.paymentUrl) {
        window.open(result.data.paymentUrl, "_blank");
      }

      // Redirect to order page
      router.push(`/myorder?orderId=${result.data.orderId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Terjadi kesalahan, silakan coba lagi");
      console.error("Guest checkout error:", error);
    },
  });
}

/**
 * Authenticated checkout mutation hook
 * Handles authenticated user checkout with automatic cart invalidation and navigation
 */
export function useAuthenticatedCheckout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (params: {
      addressId: string;
      selectedCourier?: string;
      selectedService?: string;
      shippingCost?: number;
    }) => {
      if (!params.addressId) {
        throw new Error("Silakan pilih alamat pengiriman");
      }
      return checkoutApi.authenticatedCheckout(params.addressId, {
        selectedCourier: params.selectedCourier,
        selectedService: params.selectedService,
        shippingCost: params.shippingCost,
      });
    },
    onSuccess: (result) => {
      // Invalidate cart to clear it after successful checkout
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      toast.success("Pesanan berhasil dibuat!");

      // Open payment in new tab
      if (result.data.paymentUrl) {
        window.open(result.data.paymentUrl, "_blank");
      }

      // Redirect to order page
      router.push(`/myorder?orderId=${result.data.orderId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Terjadi kesalahan, silakan coba lagi");
      console.error("Authenticated checkout error:", error);
    },
  });
}
