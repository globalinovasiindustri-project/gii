"use client";

import { useMemo } from "react";
import { CartItem } from "@/lib/types/cart.types";
import { Button } from "@/components/ui/button";
import { ShippingSelector } from "./shipping-selector";
import type { ShippingOption } from "@/hooks/use-shipping";

interface OrderSummaryCardProps {
  cartItems: CartItem[];
  onCheckout: () => void;
  isSubmitting: boolean;
  disabled: boolean;
  buttonText?: string;
  shippingCost?: number | null;
  courierName?: string | null;
  isCalculatingShipping?: boolean;
  // Shipping selector props
  shippingOptions?: ShippingOption[];
  selectedShippingOption?: ShippingOption | null;
  onSelectShipping?: (option: ShippingOption) => void;
  shippingError?: string;
}

export function OrderSummaryCard({
  cartItems,
  onCheckout,
  isSubmitting,
  disabled,
  buttonText = "Bayar Sekarang",
  shippingCost = null,
  courierName = null,
  isCalculatingShipping = false,
  shippingOptions = [],
  selectedShippingOption = null,
  onSelectShipping,
  shippingError,
}: OrderSummaryCardProps) {
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const hasShippingCost = shippingCost !== null && shippingCost >= 0;
  const total = subtotal + (hasShippingCost ? shippingCost : 0);

  const hasCartItems = cartItems.length > 0;
  const isDisabled = !hasCartItems || disabled || isSubmitting;

  return (
    <div className="space-y-6 leading-tight tracking-tight">
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/75 font-medium ">Subtotal</span>
          <span className="font-medium text-base">
            Rp{subtotal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-foreground/75 font-medium">Ongkos Kirim</span>
            {courierName && (
              <span className="text-xs text-muted-foreground">
                {courierName}
              </span>
            )}
          </div>
          <span className="font-medium">
            {isCalculatingShipping ? (
              <span className="text-muted-foreground">Menghitung...</span>
            ) : hasShippingCost ? (
              `Rp${shippingCost.toLocaleString("id-ID")}`
            ) : (
              <span className="text-muted-foreground">Pilih pengiriman</span>
            )}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-lg font-medium tracking-tight">Total</span>
          <span className="text-xl font-medium tracking-tight">
            {hasShippingCost ? (
              `Rp${total.toLocaleString("id-ID")}`
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </span>
        </div>
      </div>

      {/* Shipping Selector */}
      {onSelectShipping && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Metode Pengiriman</label>
          <ShippingSelector
            options={shippingOptions}
            selectedOption={selectedShippingOption}
            onSelect={onSelectShipping}
            isLoading={isCalculatingShipping}
            error={shippingError}
            disabled={disabled || isSubmitting}
          />
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={isDisabled}
        onClick={onCheckout}
      >
        {isSubmitting ? "Memproses..." : buttonText}
      </Button>
    </div>
  );
}
