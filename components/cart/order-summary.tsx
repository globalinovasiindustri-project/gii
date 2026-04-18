"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderSummaryProps {
  totalItems: number;
  totalPrice: number;
  hasItems: boolean;
  isAuthenticated?: boolean;
}

function OrderSummaryDesktop({
  totalItems,
  totalPrice,
  hasItems,
  isAuthenticated,
}: OrderSummaryProps) {
  return (
    <div className="hidden lg:block rounded-lg border p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Ringkasan Belanja</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Produk</span>
          <span className="font-medium">{totalItems} item</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Harga</span>
          <span className="font-medium">
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </div>

        <p className="text-xs text-gray-500 pt-2">Belum termasuk ongkir</p>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">Total</span>
          <span className="text-xl font-medium">
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <Button
        className="w-full"
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

function OrderSummaryMobile({
  totalItems,
  totalPrice,
  hasItems,
  isAuthenticated,
}: OrderSummaryProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t-2 shadow-lg p-4">
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Produk</span>
          <span className="font-medium">{totalItems} item</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Harga</span>
          <span className="font-medium">
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </div>

        <p className="text-xs text-gray-500 pt-1">Belum termasuk ongkir</p>
      </div>

      <Button
        className="w-full"
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

export function OrderSummary(props: OrderSummaryProps) {
  return (
    <>
      <OrderSummaryDesktop {...props} />
      <OrderSummaryMobile {...props} />
    </>
  );
}
