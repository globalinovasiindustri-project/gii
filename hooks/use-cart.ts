"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-auth";
import type { CartItem, ProductData } from "@/lib/types/cart.types";

export interface CartItemResponse extends CartItem {}

export interface ProductDataInput extends ProductData {}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItem[];
    lastUpdated: number;
    sessionId?: string;
  };
}

export interface CartMutationResponse {
  success: boolean;
  message: string;
  data: {
    lastUpdated: number;
  };
}

export interface CartItemValidation {
  itemId: string;
  valid: boolean;
  type?: "OUT_OF_STOCK" | "PRODUCT_UNAVAILABLE" | "PRICE_CHANGED";
  message?: string;
  suggestedAction?: "REMOVE" | "UPDATE_QUANTITY" | "UPDATE_PRICE";
  currentStock?: number;
  currentPrice?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: CartItemValidation[];
}

export interface CartValidateResponse {
  success: boolean;
  message: string;
  data: ValidationResult;
}

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const response = await fetch("/api/cart", {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load cart");
    }

    return response.json();
  },

  addItem: async (
    product: ProductData,
    quantity: number
  ): Promise<CartMutationResponse> => {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add item");
    }

    return response.json();
  },

  removeItem: async (itemId: string): Promise<CartMutationResponse> => {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove item");
    }

    return response.json();
  },

  updateQuantity: async (
    itemId: string,
    quantity: number
  ): Promise<CartMutationResponse> => {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update quantity");
    }

    return response.json();
  },

  clearCart: async (): Promise<CartMutationResponse> => {
    const response = await fetch("/api/cart", {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to clear cart");
    }

    return response.json();
  },

  validateCart: async (items: CartItem[]): Promise<CartValidateResponse> => {
    const response = await fetch("/api/cart/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to validate cart");
    }

    return response.json();
  },
};

export function useCart() {
  const { data: userData } = useMe();
  const userId = userData?.data?.id;

  const query = useQuery({
    queryKey: ["cart", userId || "guest"],
    queryFn: () => cartApi.getCart(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, max 30s
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to load cart");
      },
    },
  });

  return query;
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      product,
      quantity,
    }: {
      product: ProductData;
      quantity: number;
    }) => cartApi.addItem(product, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item");
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueriesData<CartResponse>({ queryKey: ["cart"] });

      queryClient.setQueriesData<CartResponse>({ queryKey: ["cart"] }, (old) => {
        if (!old?.data?.items) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.filter((item) => item.id !== itemId),
            lastUpdated: Date.now(),
          },
        };
      });

      return { previous };
    },
    onError: (error: Error, _itemId, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error(error.message || "Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateQuantity(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueriesData<CartResponse>({ queryKey: ["cart"] });

      queryClient.setQueriesData<CartResponse>({ queryKey: ["cart"] }, (old) => {
        if (!old?.data?.items) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
            lastUpdated: Date.now(),
          },
        };
      });

      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error(error.message || "Failed to update quantity");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/**
 * Clear cart mutation
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });
}
