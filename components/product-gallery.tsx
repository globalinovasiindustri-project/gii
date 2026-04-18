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
    <div className="flex flex-col gap-3 md:gap-4 h-full">
      {/* Thumbnails - Mobile (horizontal) */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2 ">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative size-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:border-black bg-muted/80 p-2",
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

      {/* Desktop Layout: Main Image + Thumbnails */}
      <div className="hidden md:flex md:flex-row gap-3 md:gap-5 h-full">
        {/* Thumbnails - Desktop (vertical, top-aligned on right) */}
        <div className="flex flex-col gap-2 md:gap-4 items-start">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative size-20 lg:size-32 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:border-black bg-muted/80 p-2",
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

        {/* Main Image */}
        <Card
          className={cn(
            "overflow-hidden flex items-center rounded-2xl h-full shadow-sm border-none bg-muted/80 flex-1",
          )}
        >
          <div className="relative w-full p-4 aspect-square">
            <Image
              src={currentImage?.src || "/placeholder.svg"}
              alt={currentImage?.alt || "Main product image"}
              className="object-contain m-auto h-full mix-blend-multiply"
              width={1000}
              height={1000}
            />
          </div>
        </Card>
      </div>

      {/* Mobile: Main Image (below thumbnails) */}
      <Card
        className={cn(
          "md:hidden overflow-hidden rounded-2xl shadow-sm border-none bg-muted/80",
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
    </div>
  );
}
