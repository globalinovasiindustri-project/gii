"use client";

import { useEffect, useState, useMemo } from "react";
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
} from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { CartItem } from "@/components/cart/cart-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import { CartPageSkeleton } from "@/components/cart/cart-page-skeleton";
import { ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MainNavigation } from "@/components/common/main-navigation";
import { cartApi, type ValidationResult } from "@/hooks/use-cart";

export default function CartPage() {
  // Track if component is mounted on client (Requirement 9.3, 9.4)
  const [isMounted, setIsMounted] = useState(false);

  // Auth hook
  const { me, isMeLoading } = useAuth();
  const isAuthenticated = !!me?.data?.id;

  // Query hooks
  const cartQuery = useCart();
  const items = cartQuery.data?.data?.items || [];
  const lastSyncedAt = cartQuery.data?.data?.lastUpdated || null;

  // Mutation hooks
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveFromCart();

  // Computed values - all items are now included
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const hasItems = items.length > 0;

  const cartLoading = cartQuery.isLoading;
  const isSyncing =
    updateQuantityMutation.isPending || removeItemMutation.isPending;

  const syncError =
    updateQuantityMutation.error?.message ||
    removeItemMutation.error?.message ||
    null;

  // Action handlers
  const updateQuantity = (itemId: string, quantity: number) => {
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const retrySync = () => {
    cartQuery.refetch();
  };

  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Set mounted flag on client (Requirement 9.3, 9.4)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validate cart items on page load and when items change
  useEffect(() => {
    const validateCart = async () => {
      if (items.length === 0) {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);
      try {
        // Call validation API
        const response = await cartApi.validateCart(items);
        const result = response.data;
        setValidationResult(result);

        // Auto-apply suggested actions for validation errors
        if (!result.valid) {
          for (const error of result.errors) {
            if (error.suggestedAction === "REMOVE") {
              // Auto-remove unavailable items
              removeItem(error.itemId);
            } else if (
              error.suggestedAction === "UPDATE_QUANTITY" &&
              error.currentStock !== undefined
            ) {
              // Auto-adjust quantity to available stock
              updateQuantity(error.itemId, error.currentStock);
            } else if (
              error.suggestedAction === "UPDATE_PRICE" &&
              error.currentPrice !== undefined
            ) {
              // Price changes are handled by showing warning only
              // The actual price update happens on checkout
            }
          }
        }
      } catch (error) {
        console.error("Failed to validate cart:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validateCart();
  }, [items.length]); // Only validate when item count changes

  // Loading state - Show during hydration or loading (Requirement 9.4, 9.5)
  const isLoading = !isMounted || cartLoading || isValidating;

  // Loading skeleton component
  if (isLoading) {
    return (
      <>
        <MainNavigation />
        <CartPageSkeleton />
      </>
    );
  }

  return (
    <>
      <MainNavigation />
      <div className="container mx-auto px-4 py-4 md:py-8 pb-32 lg:pb-8 tracking-tight">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h1 className="text-xl font-medium tracking-tight leading-tight md:text-2xl">
            Keranjang Belanja
          </h1>
        </div>

        {items.length === 0 ? (
          // Empty cart state
          <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 scale-150"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-full">
                <ShoppingBag
                  className="size-16 md:size-20 text-blue-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">
              Keranjang Belanja Kosong
            </h2>
            <p className="text-gray-500 mb-8 max-w-md text-sm md:text-base">
              Belum ada produk di keranjang Anda. Mulai berbelanja dan temukan
              produk favorit Anda!
            </p>
            <Button asChild size="lg" className="px-8">
              <Link href="/shop">Lanjut Belanja</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Cart Items List */}
            <div className="lg:col-span-2">
              {/* Validation Warnings */}
              {validationResult && !validationResult.valid && (
                <div className="mb-4 space-y-2">
                  {validationResult.errors.map((error) => (
                    <Alert key={error.itemId} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Cart Items */}
              <div className=" divide-y">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    variant="page"
                    selectable={false}
                    onQuantityChange={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                totalItems={totalItems}
                totalPrice={totalPrice}
                hasItems={hasItems}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
