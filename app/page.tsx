import { MainNavigation } from "@/components/common/main-navigation";
import { HeroSection } from "@/components/hero-section";
import { BrandSection } from "@/components/landing-page/brand-section";
import { GuaranteeSection } from "@/components/landing-page/guarantee-section";
import { ProductCarouselSection } from "@/components/product-carousel-section";
import { SiteFooter } from "@/components/common/site-footer";
import { BulkOrderSection } from "@/components/bulk-order-section";
import { StoryBanner } from "@/components/story-banner";
import { formatPrice } from "@/lib/utils/product.utils";
import { productService } from "@/lib/services/product.service";

// Revalidate every hour for fresh content while maintaining static generation
export const revalidate = 3600;

interface SimplifiedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  slug: string;
  price: number;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface ProductAPIResponse {
  success: boolean;
  message: string;
  data: SimplifiedProduct[];
}

interface CarouselProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  thumbnailUrl: string | null;
}

async function fetchProducts(
  sortBy: "newest" | "random"
): Promise<CarouselProduct[]> {
  try {
    // Fetch directly from service for better performance and SEO
    const result = await productService.getProductGroups(
      {
        isActive: true,
        sortBy: sortBy,
        limit: 10,
      },
      "user"
    );

    // Transform to carousel format
    return result.products.map((product) => {
      const images = product.productGroup.images || [];
      const thumbnailUrl =
        images.find((img: any) => img.isThumbnail)?.url ||
        images[0]?.url ||
        null;

      // Get lowest price from products
      const lowestPrice = Math.min(...product.products.map((p) => p.price));

      return {
        id: product.productGroup.id,
        name: product.productGroup.name,
        brand: product.productGroup.brand,
        slug: product.productGroup.slug,
        price: formatPrice(lowestPrice),
        thumbnailUrl,
      };
    });
  } catch (error) {
    console.error(`Error fetching ${sortBy} products:`, error);
    return [];
  }
}

export default async function Home() {
  // Fetch newest and random products in parallel
  const [newestProducts, randomProducts] = await Promise.all([
    fetchProducts("newest"),
    fetchProducts("random"),
  ]);

  return (
    <div className="flex min-h-screen flex-col tracking-tight w-full">
      <main className="flex-col flex-1">
        <MainNavigation />
        <div className="flex flex-col gap-20">
          <HeroSection />
          <BrandSection />
          <ProductCarouselSection title="Terbaru" products={newestProducts} />
          <GuaranteeSection />
          <ProductCarouselSection
            title="Paling Laris"
            products={randomProducts}
          />
          <BulkOrderSection />
          <StoryBanner />
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
