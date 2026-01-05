"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";

interface CarouselProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  thumbnailUrl: string | null;
}

interface ProductCarouselSectionProps {
  title: string;
  products: CarouselProduct[];
}

export function ProductCarouselSection({
  title,
  products,
}: ProductCarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Adjust as needed
      if (direction === "left") {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Handle empty products array gracefully
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="">
      <div className="mb-8 flex items-center justify-between mx-4 md:mx-10">
        <h2 className="text-xl font-semibold tracking-tighter leading-tight md:text-3xl">
          {title}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-gray-300 bg-transparent"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-gray-300 bg-transparent"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-scroll pb-4 scrollbar-hide pl-4 md:pl-10"
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px]">
            <ProductCard
              imageSrc={product.thumbnailUrl || "/placeholder.svg"}
              imageAlt={product.name}
              brand={product.brand}
              title={product.name}
              price={product.price}
              slug={product.slug}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
