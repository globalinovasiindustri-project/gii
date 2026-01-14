import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GuaranteeSection() {
  return (
    <section className="w-full px-4 md:px-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tighter leading-tight md:text-4xl">
            Produk kami resmi, bergaransi, —tanpa kompromi.
          </h2>
          <Button
            variant="outline"
            asChild
            className="group border-black px-6 py-3 text-black hover:bg-black hover:text-white bg-transparent"
          >
            <Link href="#">
              Our Story
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="space-y-6">
          <p className="text-base text-foreground/80">
            Seluruh produk di BeliElektronik merupakan barang resmi yang
            didistribusikan langsung oleh mitra terpercaya dan dilengkapi dengan
            garansi nasional. Dari smartphone, perangkat rumah tangga, hingga
            gadget terbaru – semua tersedia untuk mendukung gaya hidup Anda.
          </p>
          <p className="text-base text-foreground/80">
            Discover the passion behind our designs and the community we're
            building together.
          </p>
        </div>
      </div>
    </section>
  );
}
