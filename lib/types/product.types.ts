// Type definitions for product variant validation

export interface ValidVariantCombinations {
  variantTypes: string[];
  combinations: Array<{
    productId: string;
    variants: Record<string, string>;
    price: number;
    stock: number;
    isActive: boolean;
  }>;
  availabilityMap: Record<string, Record<string, boolean>>;
}

export interface VariantAvailability {
  variantType: string;
  value: string;
  available: boolean;
  inStock: boolean;
  lowestPrice?: number;
}
