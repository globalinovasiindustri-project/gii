"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/types/cart.types";

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
  const { id, name, price, quantity, thumbnailUrl, variantSelections, sku } =
    item;

  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local quantity with prop changes
  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  // Format variant selections for display
  const variantText = Object.entries(variantSelections)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  // Calculate subtotal
  const subtotal = price * localQuantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }

    // Update local state immediately for responsive UI
    setLocalQuantity(newQuantity);
    setIsUpdating(true);

    // Debounce the actual update (500ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onQuantityChange(id, newQuantity);
      setIsUpdating(false);
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
    "flex py-4 md:py-6 gap-3 md:gap-4 transition-all duration-300 ease-in-out",
    variant === "drawer" ? "gap-4" : "gap-4 md:gap-6",
    "hover:bg-gray-50 px-3 md:px-4 transition-colors",
    isRemoving && "opacity-0 scale-95 h-0 py-0 overflow-hidden",
    isUpdating && "scale-[0.99]"
  );

  // Generate product detail link from SKU
  const productSlug = sku.toLowerCase();

  return (
    <div className={containerClasses}>
      {/* Product Image with Link */}
      <Link href={`/product/${productSlug}`} className="flex-shrink-0">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg bg-gray-100 hover:opacity-80 transition-opacity cursor-pointer",
            imageSize
          )}
        >
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col justify-between gap-2 md:gap-3 flex-1 min-w-0">
        {/* Product Info */}
        <div className="flex flex-col gap-1">
          <Link
            href={`/product/${productSlug}`}
            className="hover:text-blue-600 transition-colors"
          >
            <h3 className="text-sm md:text-base line-clamp-2">{name}</h3>
          </Link>
          {variantText && (
            <p className="text-xs md:text-sm text-gray-500">{variantText}</p>
          )}
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm md:text-base">
              Rp{price.toLocaleString("id-ID")}
            </p>
            {variant === "page" && (
              <p className="text-xs md:text-sm text-gray-600">
                Subtotal: Rp{subtotal.toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-1">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(localQuantity - 1)}
                aria-label="Kurangi jumlah"
              >
                {localQuantity > 1 ? (
                  <Minus className="size-4" strokeWidth={1.5} />
                ) : (
                  <Trash2 className="size-4" strokeWidth={1.5} />
                )}
              </Button>

              <Input
                type="number"
                value={localQuantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  if (newQuantity > 0) {
                    handleQuantityChange(newQuantity);
                  }
                }}
                className="w-12 h-8 border-0 bg-gray-100 text-sm text-center [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                aria-label="Jumlah produk"
                min="1"
              />

              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(localQuantity + 1)}
                aria-label="Tambah jumlah"
              >
                <Plus className="size-4" strokeWidth={1.5} />
              </Button>
            </div>

            {/* Remove button (visible in page variant or always for drawer) */}
            {variant === "page" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleRemove}
                aria-label="Hapus item"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
