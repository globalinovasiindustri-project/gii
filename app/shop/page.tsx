import { Button } from "@/components/ui/button";
import { productService } from "@/lib/services/product.service";
import type { Metadata } from "next";
import {
  parseShopParams,
  calculateActiveFilterCount,
  calculatePaginationIndices,
} from "@/lib/utils/parse-shop-params";
import { ShopLayout } from "./_components/shop-layout";

// Apply Next.js revalidation
export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;

  // Build dynamic title based on active filters
  const titleParts: string[] = [];

  if (params.brand) {
    titleParts.push(params.brand);
  }

  if (params.category) {
    titleParts.push(params.category);
  }

  titleParts.push("Shop");

  const title = titleParts.join(" | ");

  // Build dynamic description based on active filters
  let description = "Browse our product catalog";

  if (params.category && params.brand) {
    description = `Shop ${params.brand} ${params.category} products`;
  } else if (params.category) {
    description = `Browse ${params.category} products`;
  } else if (params.brand) {
    description = `Shop ${params.brand} products`;
  }

  if (params.search) {
    description += ` - Search results for "${params.search}"`;
  }

  // Build canonical URL with current search parameters
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const canonicalUrl = new URL("/shop", baseUrl);

  // Add all search parameters to canonical URL
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      canonicalUrl.searchParams.set(key, value);
    }
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl.toString(),
    },
    alternates: {
      canonical: canonicalUrl.toString(),
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  try {
    // Parse and await search parameters
    const params = await searchParams;

    // Fetch filter metadata first (needed for parsing)
    const [categories, brands, priceRange] = await Promise.all([
      productService.getCategories(),
      productService.getBrands(),
      productService.getPriceRange(),
    ]);

    // Parse and validate all parameters
    const { filters, currentFilters, page, limit, sortBy } = parseShopParams(
      params,
      priceRange
    );

    // Fetch products with parsed filters
    const productResult = await productService.getProductGroups(
      filters,
      "user"
    );

    const { products, totalCount, totalPages } = productResult;

    // Calculate pagination display
    const { startIndex, endIndex } = calculatePaginationIndices(
      page,
      limit,
      totalCount
    );

    // Calculate active filter count for mobile button
    const activeFilterCount = calculateActiveFilterCount(
      currentFilters,
      priceRange
    );

    // Prepare filter data for ShopLayout
    const filterData = { categories, brands, priceRange };

    // Prepare pagination data for ShopLayout
    const pagination = {
      page,
      totalPages,
      totalCount,
      limit,
    };

    // Prepare display indices for ShopLayout
    const displayIndices = { startIndex, endIndex };

    return (
      <ShopLayout
        filterData={filterData}
        currentFilters={currentFilters}
        sortBy={sortBy}
        products={products}
        pagination={pagination}
        displayIndices={displayIndices}
        activeFilterCount={activeFilterCount}
      />
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="flex min-h-screen flex-col tracking-tight w-full">
        <main className="flex-col flex-1 p-4 md:p-8">
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4">
              Failed to load products. Please try again later.
            </p>
            <Button variant="outline" asChild>
              <a href="/shop">Retry</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }
}
