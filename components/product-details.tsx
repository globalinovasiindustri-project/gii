"use client";

import Link from "next/link";

import {
  Minus,
  Plus,
  Facebook,
  Twitter,
  PinIcon as Pinterest,
  Send,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Rating, RatingButton } from "./ui/shadcn-io/rating";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SelectProduct } from "@/lib/db/schema";

interface VariantOption {
  type: string; // e.g., "Warna", "Kapasitas"
  value: string; // e.g., "Black", "256GB"
  available: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

interface ProductDetailsProps {
  brand: string;
  title: string;
  description?: string;
  selectedProduct: SelectProduct | null;
  variantGroups: Array<{
    type: string;
    options: VariantOption[];
  }>;
  selectedVariants: Record<string, string>;
  onVariantChange: (variantType: string, value: string) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}

export function ProductDetails({
  brand,
  title,
  description,
  selectedProduct,
  variantGroups,
  selectedVariants,
  onVariantChange,
  quantity,
  onQuantityChange,
  onAddToCart,
}: ProductDetailsProps) {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    const stock = selectedProduct?.stock ?? 0;

    // Don't allow quantity to exceed stock
    if (newQuantity > stock && stock > 0) {
      return;
    }

    onQuantityChange(newQuantity);
  };

  const stock = selectedProduct?.stock ?? 0;
  const price = selectedProduct?.price ?? 0;
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

  const stockPercentage = (stock / 10) * 100; // Assuming max stock for progress bar is 10
  const isOutOfStock = stock === 0;
  const isAddToCartDisabled = !selectedProduct || isOutOfStock;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase text-gray-500">{brand}</p>
        <h1 className="text-2xl font-semibold tracking-tighter md:text-3xl lg:text-4xl">
          {title}
        </h1>
        {/* Yellow theme */}
        <div className="flex items-center gap-2">
          <Rating defaultValue={5}>
            {Array.from({ length: 5 }).map((_, index) => (
              <RatingButton className="text-yellow-500" key={index} />
            ))}
          </Rating>
          <span className="text-sm text-muted-foreground">{`(200 Review)`}</span>
        </div>
      </div>
      <p className="text-2xl font-medium">{formattedPrice}</p>
      {description && (
        <p className="text-foreground/70 line-clamp-7">{description}</p>
      )}

      {/* Variant Selection */}
      <TooltipProvider>
        {variantGroups.map((group) => {
          const allOptionsUnavailable = group.options.every(
            (option) => option.disabled || !option.available
          );

          return (
            <div key={group.type} className="space-y-2">
              <p className="text-sm font-medium">
                {group.type}:{" "}
                <span className="font-normal">
                  {selectedVariants[group.type]}
                </span>
              </p>
              {allOptionsUnavailable ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    Tidak ada opsi {group.type.toLowerCase()} yang tersedia
                    untuk kombinasi ini
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const isDisabled = option.disabled || !option.available;
                    const isSelected =
                      selectedVariants[group.type] === option.value;

                    const button = (
                      <Button
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "min-w-[48px] rounded-md border border-gray-300 px-4 py-2 text-sm",
                          isSelected
                            ? "bg-black text-white hover:bg-black"
                            : "bg-white text-black hover:bg-gray-100",
                          isDisabled && "cursor-not-allowed opacity-50"
                        )}
                        onClick={() =>
                          onVariantChange(group.type, option.value)
                        }
                        disabled={isDisabled}
                      >
                        {option.value}
                      </Button>
                    );

                    // Wrap disabled buttons with tooltip
                    if (isDisabled && option.disabledReason) {
                      return (
                        <Tooltip key={option.value}>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent>
                            <p>{option.disabledReason}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return button;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </TooltipProvider>

      {/* Stock Indicator */}
      {selectedProduct && (
        <>
          {stock <= 5 && stock > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-600">
                Hurry, only {stock} items left in stock!
              </p>
              <Progress
                value={stockPercentage}
                className="h-2 w-full [&>*]:bg-red-600"
              />
            </div>
          )}
          {isOutOfStock && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">
                Stok habis - Produk tidak tersedia
              </p>
            </div>
          )}
          {stock > 5 && <p className="text-sm text-green-600">Stok tersedia</p>}
        </>
      )}

      {/* Share Icons */}
      <div className="flex space-x-4 pt-4">
        <span className="text-sm font-medium">Share:</span>
        <Link href="#" aria-label="Share on Facebook">
          <Facebook className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share on X (Twitter)">
          <Twitter className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share on Pinterest">
          <Pinterest className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share via Telegram">
          <Send className="size-5 text-gray-600 hover:text-black" />
        </Link>
        <Link href="#" aria-label="Share via Email">
          <Mail className="size-5 text-gray-600 hover:text-black" />
        </Link>
      </div>

      {/* Quantity and Add to Cart */}
      <div className="flex gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            aria-label="Decrease quantity"
            disabled={isAddToCartDisabled}
          >
            <Minus className="size-4" />
          </Button>
          <Input
            type="text"
            value={quantity}
            onChange={(e) =>
              onQuantityChange(Math.max(1, Number(e.target.value) || 1))
            }
            className="w-12 border-x border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
            aria-label="Product quantity"
            disabled={isAddToCartDisabled}
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            aria-label="Increase quantity"
            disabled={isAddToCartDisabled}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <Button
          className="flex-1"
          onClick={onAddToCart}
          disabled={isAddToCartDisabled}
          size={"lg"}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
