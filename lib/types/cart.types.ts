/**
 * Shared Cart Types and Interfaces
 * Defines all types used across cart implementation (TanStack Query)
 * Moved from Zustand store to be framework-agnostic
 */

/**
 * Represents a single item in the shopping cart
 */
export interface CartItem {
  /** Unique cart item ID */
  id: string;
  /** Product ID from database */
  productId: string;
  /** Product group ID */
  productGroupId: string;
  /** Product name (snapshot at time of adding) */
  name: string;
  /** Product SKU (snapshot) */
  sku: string;
  /** Price at time of adding */
  price: number;
  /** Quantity in cart */
  quantity: number;
  /** Available stock (snapshot) */
  stock: number;
  /** Product thumbnail URL */
  thumbnailUrl: string | null;
  /** Variant selections (e.g., { "Warna": "Black", "Kapasitas": "128GB" }) */
  variantSelections: Record<string, string>;
  /** Weight in grams (from product group) */
  weight: number;
  /** Timestamp when added */
  addedAt: number;
  /** Timestamp when last updated */
  updatedAt: number;
}

/**
 * Data required to add a product to cart
 */
export interface ProductData {
  productId: string;
  productGroupId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  thumbnailUrl: string | null;
  variantSelections: Record<string, string>;
}

/**
 * Cart state stored in localStorage
 */
export interface CartStorageData {
  items: CartItem[];
  lastUpdated: number;
}

/**
 * Type utility: Generate cart item ID from product data
 */
export type CartItemIdGenerator = (
  productId: string,
  variantSelections: Record<string, string>
) => string;

/**
 * Type utility: Calculate item subtotal
 */
export type ItemSubtotalCalculator = (item: CartItem) => number;
