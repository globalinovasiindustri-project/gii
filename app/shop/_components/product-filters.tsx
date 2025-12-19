"use client";

import { X, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useFilterState,
  type FilterData,
  type FilterValues,
} from "@/hooks/use-filter-state";

export interface ProductFiltersProps {
  data: FilterData;
  currentFilters: FilterValues;
  mode: "instant" | "deferred";
  className?: string;
}

export function ProductFilters({
  data,
  currentFilters,
  mode,
  className,
}: ProductFiltersProps) {
  const { values, handlers, actions, meta } = useFilterState({
    mode,
    data,
    currentFilters,
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Clear All button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Filters</h2>
        {meta.activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.clearAll}
            className="h-8 text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {meta.activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {meta.currentFilters.categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => actions.removeCategory(category)}
            >
              {category}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {meta.currentFilters.brands.map((brand) => (
            <Badge
              key={brand}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => actions.removeBrand(brand)}
            >
              {brand}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {meta.currentFilters.search && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={actions.removeSearch}
            >
              Search: {meta.currentFilters.search}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {(meta.currentFilters.minPrice !== data.priceRange.min ||
            meta.currentFilters.maxPrice !== data.priceRange.max) && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={actions.removePriceRange}
            >
              Price: Rp
              {(
                meta.currentFilters.minPrice || data.priceRange.min
              ).toLocaleString()}{" "}
              - Rp
              {(
                meta.currentFilters.maxPrice || data.priceRange.max
              ).toLocaleString()}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Search Products
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Contoh: iPhone 17 Pro..."
            value={values.search}
            onChange={(e) => handlers.onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filters */}
      {data.categories.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Categories</Label>
          <div className="space-y-2">
            {data.categories.map((category) => {
              const isChecked = values.categories.includes(category.name);
              return (
                <div
                  key={category.name}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`category-${category.name}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handlers.onCategoryChange(category.name, checked === true)
                    }
                  />
                  <label
                    htmlFor={`category-${category.name}`}
                    className="flex-1 text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                    <span className="ml-1 text-muted-foreground">
                      ({category.count})
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Filters */}
      {data.brands.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Brands</Label>
          <div className="space-y-2">
            {data.brands.map((brand) => {
              const isChecked = values.brands.includes(brand.name);
              return (
                <div key={brand.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.name}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handlers.onBrandChange(brand.name, checked === true)
                    }
                  />
                  <label
                    htmlFor={`brand-${brand.name}`}
                    className="flex-1 text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.name}
                    <span className="ml-1 text-muted-foreground">
                      ({brand.count})
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      {data.priceRange.max > data.priceRange.min && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="space-y-4">
            <Slider
              min={data.priceRange.min}
              max={data.priceRange.max}
              step={10000}
              value={values.priceRange}
              onValueChange={(value) =>
                handlers.onPriceChange(value as number[])
              }
              onValueCommit={handlers.onPriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Rp{values.priceRange[0].toLocaleString()}</span>
              <span>Rp{values.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Apply button for deferred mode */}
      {mode === "deferred" && (
        <Button onClick={actions.applyFilters} className="w-full">
          Apply Filters
        </Button>
      )}
    </div>
  );
}
