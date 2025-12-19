import { Button } from "@/components/ui/button";
import { MainNavigation } from "@/components/common/main-navigation";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";
import { SortSelect } from "./sort-select";
import { PaginationControls } from "./pagination-controls";
import type { FilterData, FilterValues } from "@/hooks/use-filter-state";
import type { CompleteProduct } from "@/hooks/use-products";

export interface ShopLayoutProps {
  // Filter metadata
  filterData: FilterData;
  // Current filter values from URL
  currentFilters: FilterValues;
  // Sort option
  sortBy: string;
  // Products
  products: CompleteProduct[];
  // Pagination
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  // Display indices
  displayIndices: {
    startIndex: number;
    endIndex: number;
  };
  // Active filter count for mobile badge
  activeFilterCount: number;
}

export function ShopLayout({
  filterData,
  currentFilters,
  sortBy,
  products,
  pagination,
  displayIndices,
  activeFilterCount,
}: ShopLayoutProps) {
  const { page, totalPages, totalCount } = pagination;
  const { startIndex, endIndex } = displayIndices;

  return (
    <div className="flex min-h-screen flex-col tracking-tight w-full">
      <MainNavigation />
      <main className="flex-col flex-1 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters - Hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-10">
              <ProductFilters
                data={filterData}
                currentFilters={currentFilters}
                mode="instant"
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header with Mobile Filters and Sort */}
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* Mobile Filter Sheet - Hidden on desktop */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                        >
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full sm:max-w-md overflow-y-auto"
                  >
                    <div className="py-6">
                      <ProductFilters
                        data={filterData}
                        currentFilters={currentFilters}
                        mode="deferred"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort Select */}
              <div className="ml-auto">
                <SortSelect currentSort={sortBy} />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {totalCount > 0 ? startIndex + 1 : 0}-{endIndex} of{" "}
                {totalCount} products
              </p>
            </div>

            {/* Product Grid */}
            <div className="mb-8">
              <ProductGrid products={products} />
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  totalResults={totalCount}
                  resultsPerPage={12}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
