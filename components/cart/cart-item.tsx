"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { VARIANT_TYPES } from "@/lib/enums";
import type { CartItem as CartItemType } from "@/lib/types/cart.types";

// Helper function to get variant label from value
const getVariantLabel = (variantValue: string): string => {
  const variant = Object.values(VARIANT_TYPES).find(
    (v) => v.value === variantValue,
  );
  return variant?.label || variantValue;
};

interface CartItemProps {
  item: CartItemType;
  variant?: "drawer" | "page";
  selectable?: boolean;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
  onSelectionChange?: (id: string, selected: boolean) => void;
}

export function CartItem({
  item,
  variant = "drawer",
  selectable = false,
  onQuantityChange,
  onRemove,
  onSelectionChange,
}: CartItemProps) {
  const {
    id,
    name,
    brand,
    price,
    quantity,
    stock,
    thumbnailUrl,
    variantSelections,
    sku,
  } = item;

  const [isRemoving, setIsRemoving] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local quantity with prop changes
  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  // Format variant selections for display with Indonesian labels
  const variantText = Object.entries(variantSelections)
    .map(([key, value]) => `${getVariantLabel(key)}: ${value}`)
    .join(", ");

  // Calculate subtotal
  const subtotal = price * localQuantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }

    if (newQuantity > stock) {
      newQuantity = stock;
    }

    if (newQuantity === localQuantity) return;

    setLocalQuantity(newQuantity);

    // Debounce the actual update (500ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onQuantityChange(id, newQuantity);
    }, 500);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };

  const imageSize = variant === "drawer" ? "size-20" : "size-24 md:size-32";
  const containerClasses = cn(
    "flex py-4 md:py-8 gap-3 md:gap-4 transition-all duration-300 ease-in-out",
    variant === "drawer" ? "gap-4 py-4" : "gap-4",
    isRemoving && "opacity-0 scale-95 h-0 py-0 overflow-hidden",
  );

  // Generate product detail link from SKU
  const productSlug = sku.toLowerCase();

  return (
    <div className={containerClasses}>
      {/* Product Image with Link */}
      <Link href={`/product/${productSlug}`} className="flex-shrink-0">
        <div
          className={cn(
            "aspect-square bg-muted/80 rounded-lg p-3 flex items-center justify-center",
            imageSize,
          )}
        >
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={name}
            width={128}
            height={128}
            className="object-contain w-full h-full mix-blend-multiply"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="grid grid-cols-5 gap-4 justify-between items-center w-full">
        {/* Left side: Product Info */}
        <div
          className={cn(
            "flex flex-col gap-1",
            variant === "page" ? "col-span-4 md:col-span-3" : "col-span-3",
          )}
        >
          <p className="text-sm md:text-base">{name}</p>
          <p className="text-xs md:text-sm text-muted-foreground font-light capitalize">
            {brand}
          </p>
          {variantText && (
            <p className="text-xs md:text-sm text-muted-foreground font-light">
              {variantText}
            </p>
          )}
          <p className="font-light text-sm md:text-[15px] mt-1">
            Rp{price.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Right side: Quantity Controls */}
        <div className="col-span-1 items-start md:items-end gap-2">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
            <div className="relative">
              <input
                type="number"
                value={localQuantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  if (newQuantity > 0) {
                    handleQuantityChange(newQuantity);
                  }
                }}
                className="w-16 h-12 text-center text-sm bg-muted/75 rounded-sm pr-6 focus:outline-none focus:ring-1 focus:ring-gray-400 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:opacity-0 [&::-webkit-outer-spin-button]:opacity-0 hover:[&::-webkit-inner-spin-button]:opacity-100 hover:[&::-webkit-outer-spin-button]:opacity-100"
                aria-label="Quantity"
                min="1"
                max={stock}
              />
              <div className="absolute right-0 top-0 hidden lg:flex flex-col h-full w-6 pointer-events-none">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  className="flex-1 flex items-end justify-center pb-0.5 pointer-events-auto"
                  aria-label="Increase quantity"
                >
                  <svg
                    className="w-2 h-1.5"
                    viewBox="0 0 8 6"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M0.5 4.75L4 1.25L7.5 4.75"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  className="flex-1 flex items-start justify-center pt-0.5 pointer-events-auto"
                  aria-label="Decrease quantity"
                >
                  <svg
                    className="w-2 h-1.5"
                    viewBox="0 0 8 6"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M0.5 1.25L4 4.75L7.5 1.25"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={handleRemove}
              className="text-xs underline hover:no-underline transition-all"
              aria-label="Remove item"
            >
              Hapus
            </button>
          </div>
        </div>

        {/* Subtotal */}
        {variant === "page" && (
          <div className="hidden md:flex col-span-1 justify-end">
            {" "}
            <p className="text-sm md:text-base font-medium">
              Rp{subtotal.toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartItem;
