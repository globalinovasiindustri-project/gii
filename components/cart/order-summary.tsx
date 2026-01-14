"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderSummaryProps {
  totalItems: number;
  totalPrice: number;
  hasItems: boolean;
  isAuthenticated?: boolean;
}

export function OrderSummary({
  totalItems,
  totalPrice,
  hasItems,
  isAuthenticated = false,
}: OrderSummaryProps) {
  return (
    <div className="bg-white border rounded-lg p-4 md:p-6 lg:sticky lg:top-4 fixed bottom-0 left-0 right-0 z-10 lg:z-auto shadow-lg lg:shadow-none border-t-2 lg:border-t transition-all duration-300">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 hidden lg:block">
        Ringkasan Belanja
      </h2>

      <div className="space-y-2 md:space-y-3 mb-3 md:mb-6">
        <div className="flex justify-between text-sm transition-all duration-300">
          <span className="text-gray-600">Total Produk</span>
          <span className="font-medium">{totalItems} item</span>
        </div>

        <div className="flex justify-between text-sm transition-all duration-300">
          <span className="text-gray-600">Total Hargaaa</span>
          <span className="font-medium">
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </div>

        <p className="text-xs text-gray-500 pt-1 md:pt-2">
          Belum termasuk ongkir
        </p>
      </div>

      <div className="border-t pt-3 md:pt-4 mb-3 md:mb-4 hidden lg:block">
        <div className="flex justify-between items-center mb-4 transition-all duration-300">
          <span className="text-lg">Total</span>
          <span className="text-xl font-medium">
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <Button
        className="w-full transition-all duration-300"
        size="lg"
        disabled={!hasItems}
        asChild={hasItems}
      >
        {hasItems ? (
          <Link href="/checkout">
            {isAuthenticated ? "Selanjutnya" : "Checkout"} ({totalItems} item)
          </Link>
        ) : (
          <span>Checkout (0 item)</span>
        )}
      </Button>
    </div>
  );
}
