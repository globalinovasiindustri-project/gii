import { Button } from "@/components/ui/button";
import { AnimatedButton } from "../ui/animated-button";
import { ShoppingCartRemove01Icon } from "hugeicons-react";
import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="mx-auto min-h-[75svh] px-5 flex flex-col justify-center">
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center text-center gap-14">
        <div className="flex flex-col gap-6 items-center max-w-lg">
          <ShoppingCartRemove01Icon className="size-8 md:size-12" />
          <h1 className="font-semibold tracking-tighter text-3xl md:text-5xl">
            Keranjang kamu masih kosong :(
          </h1>
        </div>

        <AnimatedButton>
          <Link href="/shop">Lanjut Belanja</Link>
        </AnimatedButton>
      </div>
    </div>
  );
}
