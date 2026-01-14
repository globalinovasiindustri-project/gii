"use client";

import { useState, useEffect } from "react";
import { ProductGallery } from "@/components/product-gallery";
import { ProductDetails } from "@/components/product-details";
import { ProductDescription } from "@/components/product-description";
import { CartDrawer } from "@/components/cart-drawer";
import { useAddToCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import type {
  SelectProductGroup,
  SelectProductVariant,
  SelectProduct,
} from "@/lib/db/schema";
import type { ValidVariantCombinations } from "@/lib/types/product.types";

interface CompleteProduct {
  productGroup: SelectProductGroup & {
    images?: Array<{ url: string; isThumbnail: boolean }>;
    additionalDescriptions?: Array<{ title: string; body: string }>;
  };
  variants: SelectProductVariant[];
  products: SelectProduct[];
  variantSelectionsByProductId: Record<string, Record<string, string>>;
}

interface ProductDetailContentProps {
  productData: CompleteProduct;
}

interface VariantOption {
  type: string;
  value: string;
  available: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function ProductDetailContent({
  productData,
}: ProductDetailContentProps) {
  const { productGroup, variants, products } = productData;

  // Cart mutation hook
  const addToCartMutation = useAddToCart();

  // State management
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<SelectProduct | null>(
    null
  );
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [validCombinations, setValidCombinations] =
    useState<ValidVariantCombinations | null>(null);
  const [availableOptions, setAvailableOptions] = useState<
    Record<string, Set<string>>
  >({});

  // Load valid combinations on component mount
  useEffect(() => {
    async function loadValidCombinations() {
      try {
        const response = await fetch(
          `/api/products/${productGroup.id}/valid-combinations`
        );
        if (!response.ok) {
          throw new Error("Failed to load valid combinations");
        }
        const data = await response.json();
        const combinations: ValidVariantCombinations = data.data;
        setValidCombinations(combinations);

        // Initialize selected variants with first available option for each variant type
        const initialVariants: Record<string, string> = {};

        for (const variantType of combinations.variantTypes) {
          // Find first available value for this variant type
          const availableValues = Object.entries(
            combinations.availabilityMap[variantType] || {}
          )
            .filter(([_, isAvailable]) => isAvailable)
            .map(([value]) => value);

          if (availableValues.length > 0) {
            // Find first combination with stock > 0 for this variant type
            const firstWithStock = combinations.combinations.find(
              (combo) =>
                combo.variants[variantType] === availableValues[0] &&
                combo.stock > 0
            );

            if (firstWithStock) {
              initialVariants[variantType] =
                firstWithStock.variants[variantType];
            } else {
              initialVariants[variantType] = availableValues[0];
            }
          }
        }

        setSelectedVariants(initialVariants);
        updateAvailableOptions(initialVariants, combinations);
      } catch (error) {
        console.error("Failed to load valid combinations:", error);
        toast.error("Gagal memuat kombinasi varian");
      }
    }

    loadValidCombinations();
  }, [productGroup.id]);

  // Calculate which options are available based on current selections
  const updateAvailableOptions = (
    currentSelections: Record<string, string>,
    combinations: ValidVariantCombinations
  ) => {
    const available: Record<string, Set<string>> = {};

    // For each variant type
    for (const variantType of combinations.variantTypes) {
      available[variantType] = new Set();

      // Check each combination
      for (const combo of combinations.combinations) {
        // If this combination matches all current selections (except this variant type)
        const matches = Object.entries(currentSelections).every(
          ([type, value]) =>
            type === variantType || combo.variants[type] === value
        );

        // Only mark as available if it matches and has stock
        if (matches && combo.stock > 0) {
          available[variantType].add(combo.variants[variantType]);
        }
      }
    }

    setAvailableOptions(available);
  };

  // Update selected product when variants change
  useEffect(() => {
    if (validCombinations !== null) {
      // For products without variants, selectedVariants will be empty
      // For products with variants, we need all variants selected
      const hasVariants = validCombinations.variantTypes.length > 0;
      const allVariantsSelected =
        Object.keys(selectedVariants).length >=
        validCombinations.variantTypes.length;

      if (!hasVariants || allVariantsSelected) {
        findMatchingProduct(selectedVariants);
      }
    }
  }, [selectedVariants, validCombinations]);

  // Handler functions
  const handleVariantChange = (variantType: string, value: string) => {
    const newSelections = { ...selectedVariants, [variantType]: value };
    setSelectedVariants(newSelections);

    // Update available options when user changes variant selection
    if (validCombinations) {
      updateAvailableOptions(newSelections, validCombinations);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleQuantityChange = (newQuantity: number) => {
    // Ensure quantity is at least 1
    const validQuantity = Math.max(1, newQuantity);

    // Validate quantity against stock
    if (selectedProduct && validQuantity > selectedProduct.stock) {
      toast.warning("Jumlah melebihi stok tersedia", {
        description: `Stok tersedia: ${selectedProduct.stock}`,
      });
      setQuantity(selectedProduct.stock);
      return;
    }
    setQuantity(validQuantity);
  };

  const handleAddToCart = () => {
    // Validation: Check if product is selected
    if (!selectedProduct) {
      toast.error("Produk tidak tersedia");
      return;
    }

    // Validation: Check if all required variants are selected (only for products with variants)
    const variantGroups = getVariantGroups();
    if (variantGroups.length > 0) {
      const allVariantsSelected = variantGroups.every(
        (group) => selectedVariants[group.type]
      );

      if (!allVariantsSelected) {
        toast.error("Silakan pilih semua varian produk");
        return;
      }
    }

    // Validation: Check if product is in stock
    if (selectedProduct.stock === 0) {
      toast.error("Produk tidak tersedia");
      return;
    }

    // Validation: Check quantity against stock
    if (quantity > selectedProduct.stock) {
      toast.error("Jumlah melebihi stok tersedia", {
        description: `Stok tersedia: ${selectedProduct.stock}`,
      });
      return;
    }

    // Extract thumbnail from product group images
    const thumbnailUrl =
      productGroup.images?.find((img) => img.isThumbnail)?.url ||
      productGroup.images?.[0]?.url ||
      null;

    // Add item to cart
    addToCartMutation.mutate({
      product: {
        productId: selectedProduct.id,
        productGroupId: productGroup.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        thumbnailUrl,
        variantSelections: selectedVariants,
      },
      quantity,
    });

    // Show success toast with action to view cart
    toast.success("Produk berhasil ditambahkan ke keranjang", {
      description: `${selectedProduct.name} (${quantity}x)`,
      action: {
        label: "Lihat Keranjang",
        onClick: () => setIsCartDrawerOpen(true),
      },
    });
  };

  // Find exact product match by variant selections
  const findMatchingProduct = async (selections: Record<string, string>) => {
    // Check if all variant types are selected
    if (
      validCombinations &&
      Object.keys(selections).length < validCombinations.variantTypes.length
    ) {
      setSelectedProduct(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/products/${productGroup.id}/find-by-variants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variantSelections: selections }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find matching product");
      }

      const data = await response.json();
      const product = data.data;
      setSelectedProduct(product);

      // If product found, display correct price and stock
      if (product) {
        // Reset quantity if it exceeds available stock
        if (quantity > product.stock) {
          setQuantity(Math.max(1, product.stock));
        }
      }
    } catch (error) {
      console.error("Failed to find matching product:", error);
      setSelectedProduct(null);
    }
  };

  // Get variant groups structured for ProductDetails component
  const getVariantGroups = (): Array<{
    type: string;
    options: VariantOption[];
  }> => {
    // Group variants by type
    const variantsByType = variants.reduce(
      (acc, variant) => {
        if (!variant.isActive || variant.isDeleted) return acc;

        if (!acc[variant.variant]) {
          acc[variant.variant] = [];
        }
        acc[variant.variant].push(variant);
        return acc;
      },
      {} as Record<string, SelectProductVariant[]>
    );

    // Convert to array format with availability info from availableOptions state
    return Object.entries(variantsByType).map(([type, variantList]) => ({
      type,
      options: variantList.map((variant) => {
        // Check if this option is in the availableOptions set for this variant type
        const isAvailable = availableOptions[type]?.has(variant.value) ?? true;
        const isDisabled = !isAvailable;

        return {
          type: variant.variant,
          value: variant.value,
          available: isAvailable,
          disabled: isDisabled,
          disabledReason: isDisabled
            ? "Kombinasi varian ini tidak tersedia"
            : undefined,
        };
      }),
    }));
  };

  // Prepare images for ProductGallery
  const galleryImages =
    productGroup.images?.map((img, index) => ({
      src: img.url,
      alt: `${productGroup.name} - Image ${index + 1}`,
    })) || [];

  // If no images, provide placeholder
  if (galleryImages.length === 0) {
    galleryImages.push({
      src: "/placeholder.svg",
      alt: productGroup.name,
    });
  }

  const variantGroups = getVariantGroups();

  return (
    <>
      <div className="grid gap-6 md:gap-10 lg:gap-20 lg:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery
          images={galleryImages}
          selectedIndex={selectedImageIndex}
          onImageSelect={handleImageSelect}
        />

        {/* Product Details */}
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          <ProductDetails
            brand={productGroup.brand}
            title={productGroup.name}
            description={productGroup.description || undefined}
            selectedProduct={selectedProduct}
            variantGroups={variantGroups}
            selectedVariants={selectedVariants}
            onVariantChange={handleVariantChange}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
          />

          {/* Product Description */}
          <ProductDescription
            description={
              productGroup.description || "No description available."
            }
            additionalDescriptions={productGroup.additionalDescriptions}
          />
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={isCartDrawerOpen} onOpenChange={setIsCartDrawerOpen} />
    </>
  );
}
