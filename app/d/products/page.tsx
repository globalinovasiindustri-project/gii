"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "./_components/product-table";
import { ProductFilters } from "./_components/product-filters";
import { ProductSheet } from "./_components/product-sheet";
import {
  CompleteProduct,
  useProducts,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-products";
import type { ProductSchema } from "@/lib/validations/product.validation";
import { Plus } from "lucide-react";

export default function UsersPage() {
  const [selectedProduct, setSelectedProduct] =
    useState<CompleteProduct | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    isActive: undefined as boolean | undefined,
    category: "",
    brand: "",
    pageSize: 10,
  });

  // TanStack Query hooks
  const { data: productsData, isLoading } = useProducts(filters);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const handleRowClick = (data: CompleteProduct) => {
    setSelectedProduct(data);
    setSheetMode("edit");
    setIsSheetOpen(true);
  };

  const handleAddUser = () => {
    setSelectedProduct(null);
    setSheetMode("create");
    setIsSheetOpen(true);
  };

  const handleSaveProduct = (productData: ProductSchema) => {
    console.log("=== SAVING PRODUCT ===");
    console.log("Product data being saved:", productData);
    console.log("Images in product data:", productData.images);

    if (sheetMode === "edit" && selectedProduct) {
      // Update existing product
      updateProductMutation.mutate({
        id: selectedProduct.productGroup.id,
        data: productData,
      });
    } else {
      // Create new product
      createProductMutation.mutate(productData);
    }

    // Close sheet and reset state
    setIsSheetOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Produk</h1>

        <Button variant="outline" size="sm" onClick={handleAddUser}>
          <Plus className="h-4 w-4" />
          Buat Produk
        </Button>
      </div>

      {/* User Filters */}
      <ProductFilters
        searchValue={filters.search}
        onSearchChange={(value: string) =>
          setFilters({ ...filters, search: value })
        }
        brandFilter={filters.brand || "all"}
        onBrandFilterChange={(value: string) =>
          setFilters({ ...filters, brand: value === "all" ? "" : value })
        }
        categoryFilter={filters.category || "all"}
        onCategoryFilterChange={(value: string) =>
          setFilters({ ...filters, category: value === "all" ? "" : value })
        }
        statusFilter={
          filters.isActive === undefined
            ? "all"
            : filters.isActive
              ? "active"
              : "inactive"
        }
        onStatusFilterChange={(value) =>
          setFilters({
            ...filters,
            isActive:
              value === "all" ? undefined : value === "active" ? true : false,
          })
        }
      />

      {/* Product Table */}
      <ProductTable
        products={productsData?.data || []}
        onRowClick={handleRowClick}
        isLoading={isLoading}
      />

      {/* User Sheet */}
      <ProductSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        onSave={handleSaveProduct}
        selectedProduct={selectedProduct}
        mode={sheetMode}
        isSubmitting={
          createProductMutation.isPending || updateProductMutation.isPending
        }
      />
    </div>
  );
}
