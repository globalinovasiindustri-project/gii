"use client";

import { AnimatedButton } from "@/components/ui/animated-button";
import Link from "next/link";
import { Input } from "../ui/input";
import Image from "next/image";

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
    <div className="hidden lg:flex flex-col rounded-xl bg-muted/75 p-10 sticky top-4 gap-4">
      <div className="flex justify-between border-b">
        <h2 className="text-xl tracking-tight mb-4">Subtotal</h2>
        <span className="tracking-tighter font-semibold text-2xl">
          Rp{totalPrice.toLocaleString("id-ID")}
        </span>
      </div>

      <p className="text-sm font-light text-muted-foreground ">
        Termasuk pajak. Pengiriman dihitung saat check out.
      </p>

      <div className="flex flex-col gap-2 pt-4">
        <p className="text-sm tracking-tight">Tinggalkan catatan</p>
        <Input></Input>
      </div>

      {hasItems ? (
        <AnimatedButton className="w-full" asChild>
          <Link href="/checkout">
            <p className="">
              {"Selanjutnya"} ({totalItems} item)
            </p>
          </Link>
        </AnimatedButton>
      ) : (
        <AnimatedButton
          className="w-full opacity-50 cursor-not-allowed"
          disabled
        >
          <span className="text-[15px] font-medium tracking-[0.01em]">
            Checkout (0 item)
          </span>
        </AnimatedButton>
      )}

      <div className="flex flex-col items-center gap-3 pt-4">
        {" "}
        <p className="text-xs font-light text-muted-foreground ">
          Bayar dengan aman, melalui:
        </p>
        <Image
          src="/metode-pembayaran.png"
          alt="Logo"
          width={280}
          height={100}
        />
      </div>
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

      {hasItems ? (
        <AnimatedButton className="w-full" asChild>
          <Link href="/checkout">
            <span className="text-[15px] font-medium tracking-[0.01em]">
              {"Selanjutnya"} ({totalItems} item)
            </span>
          </Link>
        </AnimatedButton>
      ) : (
        <AnimatedButton
          className="w-full opacity-50 cursor-not-allowed"
          disabled
        >
          <span className="text-[15px] font-medium tracking-[0.01em]">
            Checkout (0 item)
          </span>
        </AnimatedButton>
      )}
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
