"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heroImages = [
  {
    src: "/slideshow-1.jpg?height=700&width=1400",
    alt: "Hero Image 1: Woman in hoodie with plants",
    text: "PROTECT YOU PEACE VOL.1",
  },
  {
    src: "/slideshow-2.jpg?height=700&width=1400",
    alt: "Hero Image 2: Abstract pattern",
    text: "NEW ARRIVALS",
  },
  {
    src: "/slideshow-3.png?height=700&width=1400",
    alt: "Hero Image 3: Urban streetwear",
    text: "EXPLORE THE COLLECTION",
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden">
      {/* This div acts as the viewport for the slider, ensuring it's centered and has rounded corners */}
      <div className="relative w-full max-w-[1400px]">
        {/* Aspect ratio container: 16:9 for mobile, 18:6 (3:1) for desktop */}
        <div className="relative aspect-[16/9] md:aspect-[3/1]">
          {/* This div contains all the slides and will be translated horizontally */}
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {heroImages.map((image, index) => (
              <div
                key={index}
                className="relative h-full w-full flex-shrink-0 px-4 pt-8 md:pt-10" // Add padding to create visual gap between slides
              >
                {/* Inner div for the actual image and overlay, applying the rounded corners and overflow-hidden */}
                <div className="relative h-full w-full overflow-hidden rounded-3xl">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover object-center"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - positioned absolutely inside the image (currently hidden) */}
          <div className="absolute inset-x-8 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-between md:inset-x-16">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-black"
              onClick={goToPrevious}
              aria-label="Previous slide"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-black"
              onClick={goToNext}
              aria-label="Next slide"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dots indicator - positioned below the image */}
      <div className="mt-6 mb-1 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={cn(
              "size-2.5 rounded-full transition-all duration-300",
              index === currentIndex
                ? "scale-125 bg-gray-800"
                : "bg-gray-300 hover:bg-gray-400",
            )}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
