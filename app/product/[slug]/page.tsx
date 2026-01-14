import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { MainNavigation } from "@/components/common/main-navigation";
import { SiteFooter } from "@/components/common/site-footer";
import { ProductCarouselSection } from "@/components/product-carousel-section";
import { ProductDetailContent } from "./_components/product-detail-content";
import { productService } from "@/lib/services/product.service";
import {
  transformToSimplifiedProduct,
  extractThumbnail,
  getLowestPrice,
  formatPrice,
  generateProductSchema,
} from "@/lib/utils/product.utils";
import type {
  SelectProductGroup,
  SelectProductVariant,
  SelectProduct,
} from "@/lib/db/schema";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface CarouselProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  thumbnailUrl: string | null;
}

interface CompleteProduct {
  productGroup: SelectProductGroup & {
    images?: Array<{ url: string; isThumbnail: boolean }>;
    additionalDescriptions?: Array<{ title: string; body: string }>;
  };
  variants: SelectProductVariant[];
  products: SelectProduct[];
  variantSelectionsByProductId: Record<string, Record<string, string>>;
}

/**
 * Fetches product data by slug from the database
 * Returns null if product is not found or not active
 */
async function getProductBySlug(slug: string): Promise<CompleteProduct | null> {
  try {
    const product = await productService.getProductGroupBySlug(slug, "user");
    return product as CompleteProduct | null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Fetches related products by category
 * Excludes the current product and limits results
 */
async function getRelatedProducts(
  category: string,
  excludeId: string,
  limit: number = 10
): Promise<CarouselProduct[]> {
  try {
    const result = await productService.getProductGroups(
      {
        category: category,
        isActive: true,
        sortBy: "random",
        limit: limit + 1, // Fetch one extra in case we need to filter out current product
      },
      "user"
    );

    // Filter out current product and limit results
    const filteredProducts = result.products
      .filter((p) => p.productGroup.id !== excludeId)
      .slice(0, limit);

    // Transform to carousel format
    return filteredProducts.map(transformToSimplifiedProduct);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

/**
 * Generates static params for all active products at build time
 * This enables static generation for product detail pages
 */
export async function generateStaticParams() {
  try {
    // Fetch all active products
    const result = await productService.getProductGroups(
      {
        isActive: true,
        limit: 1000, // Fetch all products for static generation
      },
      "user"
    );

    // Map products to slug params array
    return result.products.map((product) => ({
      slug: product.productGroup.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    // Return empty array on error to allow dynamic rendering
    return [];
  }
}

/**
 * Generates dynamic metadata for SEO optimization
 * Includes OpenGraph, Twitter card, and canonical URL
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Return basic metadata if product not found
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for could not be found.",
    };
  }

  const { productGroup, products } = product;

  // Extract thumbnail URL for images
  const thumbnailUrl = extractThumbnail(productGroup.images);

  // Get lowest price for display
  const lowestPrice = getLowestPrice(products);
  const formattedPrice = formatPrice(lowestPrice);

  // Generate title with product name and brand
  const title = `${productGroup.name} - ${productGroup.brand}`;

  // Generate description from product description field or fallback
  const description =
    productGroup.description ||
    `Beli ${productGroup.name} dari ${productGroup.brand}. ${formattedPrice}`;

  // Build absolute URL for canonical and images
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/product/${slug}`;
  const absoluteThumbnailUrl = thumbnailUrl
    ? thumbnailUrl.startsWith("http")
      ? thumbnailUrl
      : `${baseUrl}${thumbnailUrl}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: absoluteThumbnailUrl
        ? [
            {
              url: absoluteThumbnailUrl,
              alt: productGroup.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: absoluteThumbnailUrl ? [absoluteThumbnailUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Fetch product data by slug
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Show 404 if product not found
  if (!product) {
    notFound();
  }

  // Fetch related products by category
  const relatedProducts = await getRelatedProducts(
    product.productGroup.category,
    product.productGroup.id
  );

  // Generate structured data for SEO
  const productSchema = generateProductSchema(product);

  return (
    <div className="flex min-h-screen flex-col tracking-tight">
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />

      <MainNavigation />
      <main className="flex flex-col w-full space-y-8 md:space-y-12 lg:space-y-20 pb-8 md:pb-12 lg:pb-20">
        {/* Product Detail Content */}
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 mt-4 md:mt-6 lg:mt-10">
          <ProductDetailContent productData={product} />
        </div>
        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <ProductCarouselSection
            title="Lihat juga"
            products={relatedProducts}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
