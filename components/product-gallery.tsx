"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  selectedIndex: number;
  onImageSelect: (index: number) => void;
}

export function ProductGallery({
  images,
  selectedIndex,
  onImageSelect,
}: ProductGalleryProps) {
  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <Card
        className={cn(
          "overflow-hidden rounded-2xl shadow-sm border-none bg-muted/80",
        )}
      >
        <div className="relative aspect-square h-full p-4">
          <Image
            src={currentImage?.src || "/placeholder.svg"}
            alt={currentImage?.alt || "Main product image"}
            className="object-contain h-full mix-blend-multiply"
            width={1000}
            height={1000}
          />
        </div>
      </Card>

      {/* Thumbnails */}
      <div className="border flex md:hidden gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative size-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:border-black bg-muted/80 p-4",
              selectedIndex === index ? "border-black" : "border-transparent",
            )}
            onClick={() => onImageSelect(index)}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-contain mix-blend-multiply h-full"
            />
          </button>
        ))}
      </div>
      <div className="hidden md:flex gap-2 md:gap-4 overflow-x-auto lg:overflow-y-auto">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative size-32 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:border-black bg-muted/80 p-4",
              selectedIndex === index ? "border-black" : "border-transparent",
            )}
            onClick={() => onImageSelect(index)}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-contain mix-blend-multiply"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
