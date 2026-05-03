"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectableImageProps {
  imageUrl: string;
  alt: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function SelectableImage({
  imageUrl,
  alt,
  isSelected,
  onToggle,
}: SelectableImageProps) {
  return (
    <div className="relative group cursor-pointer" onClick={onToggle}>
      <div
        className={cn(
          "relative aspect-square rounded-lg bg-muted/80 overflow-hidden transition-all",
          isSelected
            ? "ring-2 ring-primary ring-offset-2"
            : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2",
        )}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="size-full object-cover mix-blend-multiply"
        />
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <div className="size-6 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-lg">
            {isSelected && <Check className="size-4 text-primary stroke-[3]" />}
          </div>
        </div>
      </div>
    </div>
  );
}
