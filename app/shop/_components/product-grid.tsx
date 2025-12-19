import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { CompleteProduct } from "@/hooks/use-products";

interface ProductGridProps {
  products: CompleteProduct[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  // Show empty state when no products
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-4">
          {emptyMessage || "No products found matching your filters."}
        </p>
        <Button variant="outline" asChild>
          <a href="/shop">Clear All Filters</a>
        </Button>
      </div>
    );
  }

  // Render responsive grid layout (2 cols mobile, 3 tablet, 4 desktop)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-3">
      {products.map((product) => {
        // Transform product data: Get the lowest price from products
        const lowestPrice = product.products.reduce(
          (min, p) => (p.price < min ? p.price : min),
          product.products[0]?.price || 0
        );

        // Transform product data: Get thumbnail image URL
        const thumbnailImage = product.productGroup.images?.find(
          (img) => img.isThumbnail
        );
        const imageSrc =
          thumbnailImage?.url || "/placeholder.svg?height=256&width=256";

        // Format price for display
        const formattedPrice = `Rp${lowestPrice.toLocaleString()}`;

        return (
          <ProductCard
            key={product.productGroup.id}
            imageSrc={imageSrc}
            imageAlt={product.productGroup.name}
            brand={product.productGroup.brand}
            title={product.productGroup.name}
            price={formattedPrice}
            slug={product.productGroup.slug}
            className="w-full"
          />
        );
      })}
    </div>
  );
}
