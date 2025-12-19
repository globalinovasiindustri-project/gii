import { db } from "@/lib/db/db";
import { eq, and } from "drizzle-orm";
import { carts, cartItems, products, productGroups } from "@/lib/db/schema";
import { CartItem, ProductData } from "@/lib/types/cart.types";
import { DatabaseError, NotFoundError, ValidationError } from "@/lib/errors";
import { isUserId } from "@/lib/utils/identifier.utils";
import { productService } from "@/lib/services/product.service";

/**
 * Validation result for a cart item
 */
export interface CartItemValidation {
  itemId: string;
  valid: boolean;
  type?: "OUT_OF_STOCK" | "PRODUCT_UNAVAILABLE" | "PRICE_CHANGED";
  message?: string;
  suggestedAction?: "REMOVE" | "UPDATE_QUANTITY" | "UPDATE_PRICE";
  currentStock?: number;
  currentPrice?: number;
}

/**
 * Overall validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: CartItemValidation[];
}

/**
 * Cart Service
 * Handles all cart business logic and database operations
 * Following the three-layer architecture pattern
 */
export const cartService = {
  /**
   * Get cart for user (authenticated or guest)
   * @param identifier - User ID for authenticated users or session ID for guests
   * @returns Array of cart items with product details
   */
  async getCart(identifier: string): Promise<CartItem[]> {
    try {
      // Determine if identifier is a user ID (UUID) or session ID
      const isUser = isUserId(identifier);

      // Get cart by appropriate identifier field
      const userCart = await db
        .select()
        .from(carts)
        .where(
          isUser
            ? eq(carts.userId, identifier)
            : eq(carts.sessionId, identifier)
        )
        .limit(1);

      if (userCart.length === 0) {
        return [];
      }

      const cartId = userCart[0].id;

      // Get cart items with product details using joins
      const items = await db
        .select({
          cartItem: cartItems,
          product: products,
          productGroup: productGroups,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .innerJoin(productGroups, eq(products.productGroupId, productGroups.id))
        .where(eq(cartItems.cartId, cartId));

      // Transform to CartItem format
      const transformedItems: CartItem[] = items.map((item) => {
        // Parse images from product group
        const images = item.productGroup.images
          ? JSON.parse(item.productGroup.images)
          : [];
        const thumbnailUrl =
          images.find((img: any) => img.isThumbnail)?.url ||
          images[0]?.url ||
          null;

        // Parse variant selections from JSON string
        let variantSelections: Record<string, string> = {};
        try {
          variantSelections = JSON.parse(
            item.cartItem.variantSelections || "{}"
          );
        } catch (error) {
          console.error("Error parsing variant selections:", error);
          variantSelections = {};
        }

        return {
          id: item.cartItem.id,
          productId: item.product.id,
          productGroupId: item.product.productGroupId,
          name: item.product.name,
          sku: item.product.sku,
          price: item.product.price,
          quantity: item.cartItem.quantity,
          stock: item.product.stock,
          thumbnailUrl,
          variantSelections,
          addedAt: item.cartItem.createdAt.getTime(),
          updatedAt: item.cartItem.updatedAt.getTime(),
        };
      });

      return transformedItems;
    } catch (error) {
      console.error("Error loading cart from database:", error);
      throw new DatabaseError("Failed to load cart from database");
    }
  },

  /**
   * Get cart by user ID (authenticated users only)
   * @param userId - User ID
   * @returns Array of cart items with product details
   */
  async getCartByUserId(userId: string): Promise<CartItem[]> {
    try {
      // Get cart by userId
      const userCart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);

      if (userCart.length === 0) {
        return [];
      }

      const cartId = userCart[0].id;

      // Get cart items with product details using joins
      const items = await db
        .select({
          cartItem: cartItems,
          product: products,
          productGroup: productGroups,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .innerJoin(productGroups, eq(products.productGroupId, productGroups.id))
        .where(eq(cartItems.cartId, cartId));

      // Transform to CartItem format (reusing existing transformation logic)
      const transformedItems: CartItem[] = items.map((item) => {
        // Parse images from product group
        const images = item.productGroup.images
          ? JSON.parse(item.productGroup.images)
          : [];
        const thumbnailUrl =
          images.find((img: any) => img.isThumbnail)?.url ||
          images[0]?.url ||
          null;

        // Parse variant selections from JSON string
        let variantSelections: Record<string, string> = {};
        try {
          variantSelections = JSON.parse(
            item.cartItem.variantSelections || "{}"
          );
        } catch (error) {
          console.error("Error parsing variant selections:", error);
          variantSelections = {};
        }

        return {
          id: item.cartItem.id,
          productId: item.product.id,
          productGroupId: item.product.productGroupId,
          name: item.product.name,
          sku: item.product.sku,
          price: item.product.price,
          quantity: item.cartItem.quantity,
          stock: item.product.stock,
          thumbnailUrl,
          variantSelections,
          addedAt: item.cartItem.createdAt.getTime(),
          updatedAt: item.cartItem.updatedAt.getTime(),
        };
      });

      return transformedItems;
    } catch (error) {
      console.error("Error loading cart from database:", error);
      throw new DatabaseError("Failed to load cart from database");
    }
  },

  /**
   * Add item to cart
   * @param identifier - User ID for authenticated users or session ID for guests
   * @param product - Product data to add
   * @param quantity - Quantity to add
   */
  async addItem(
    identifier: string,
    product: ProductData,
    quantity: number
  ): Promise<void> {
    try {
      // Validate quantity
      if (quantity <= 0) {
        throw new ValidationError("Quantity must be greater than 0");
      }

      // Validate product exists and is active
      const productData = await db
        .select()
        .from(products)
        .where(eq(products.id, product.productId))
        .limit(1);

      if (productData.length === 0 || !productData[0].isActive) {
        throw new ValidationError("Product not found or unavailable");
      }

      // NEW: Validate variant combination if variant selections exist
      if (
        product.variantSelections &&
        Object.keys(product.variantSelections).length > 0
      ) {
        const matchingProduct = await productService.findProductByVariants(
          product.productGroupId,
          product.variantSelections
        );

        if (!matchingProduct) {
          throw new ValidationError(
            "Invalid variant combination. This product configuration is not available."
          );
        }

        if (matchingProduct.id !== product.productId) {
          throw new ValidationError(
            "Product ID does not match variant selections."
          );
        }

        if (!matchingProduct.isActive || matchingProduct.isDeleted) {
          throw new ValidationError(
            "This product configuration is no longer available."
          );
        }

        if (matchingProduct.stock < quantity) {
          throw new ValidationError(
            `Insufficient stock. Only ${matchingProduct.stock} available for this configuration.`
          );
        }
      }

      // Check stock
      if (productData[0].stock < quantity) {
        throw new ValidationError(
          `Insufficient stock. Only ${productData[0].stock} available`
        );
      }

      // Determine if identifier is a user ID (UUID) or session ID
      const isUser = isUserId(identifier);

      await db.transaction(async (tx) => {
        // Get or create cart with appropriate identifier field
        const userCart = await tx
          .select()
          .from(carts)
          .where(
            isUser
              ? eq(carts.userId, identifier)
              : eq(carts.sessionId, identifier)
          )
          .limit(1);

        let cartId: string;

        if (userCart.length === 0) {
          // Create new cart with appropriate field (userId or sessionId)
          const [newCart] = await tx
            .insert(carts)
            .values({
              ...(isUser ? { userId: identifier } : { sessionId: identifier }),
              lastActivityAt: new Date(),
            })
            .returning();
          cartId = newCart.id;
        } else {
          cartId = userCart[0].id;
          // Update last activity
          await tx
            .update(carts)
            .set({ lastActivityAt: new Date(), updatedAt: new Date() })
            .where(eq(carts.id, cartId));
        }

        // Check if item already exists in cart
        const existingItem = await tx
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.cartId, cartId),
              eq(cartItems.productId, product.productId)
            )
          )
          .limit(1);

        if (existingItem.length > 0) {
          // Update quantity
          const newQuantity = existingItem[0].quantity + quantity;

          // Check stock for new quantity
          if (productData[0].stock < newQuantity) {
            throw new ValidationError(
              `Cannot add ${quantity} more. Only ${productData[0].stock - existingItem[0].quantity} available`
            );
          }

          await tx
            .update(cartItems)
            .set({
              quantity: newQuantity,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existingItem[0].id));
        } else {
          // Insert new cart item with variant selections
          await tx.insert(cartItems).values({
            cartId,
            productId: product.productId,
            quantity,
            variantSelections: JSON.stringify(product.variantSelections),
          });
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error("Error adding item to cart:", error);
      throw new DatabaseError("Failed to add item to cart");
    }
  },

  /**
   * Remove item from cart
   * @param identifier - User ID for authenticated users or session ID for guests
   * @param itemId - Cart item ID to remove
   */
  async removeItem(identifier: string, itemId: string): Promise<void> {
    try {
      // Determine if identifier is a user ID (UUID) or session ID
      const isUser = isUserId(identifier);

      // Get cart by appropriate identifier field
      const userCart = await db
        .select()
        .from(carts)
        .where(
          isUser
            ? eq(carts.userId, identifier)
            : eq(carts.sessionId, identifier)
        )
        .limit(1);

      if (userCart.length === 0) {
        throw new NotFoundError("Cart not found");
      }

      const cartId = userCart[0].id;

      // Delete cart item
      const result = await db
        .delete(cartItems)
        .where(and(eq(cartItems.cartId, cartId), eq(cartItems.id, itemId)))
        .returning();

      if (result.length === 0) {
        throw new NotFoundError("Cart item not found");
      }

      // Update cart last activity
      await db
        .update(carts)
        .set({ lastActivityAt: new Date(), updatedAt: new Date() })
        .where(eq(carts.id, cartId));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error removing item from cart:", error);
      throw new DatabaseError("Failed to remove item from cart");
    }
  },

  /**
   * Update item quantity
   * @param identifier - User ID for authenticated users or session ID for guests
   * @param itemId - Cart item ID
   * @param quantity - New quantity (0 removes item)
   */
  async updateQuantity(
    identifier: string,
    itemId: string,
    quantity: number
  ): Promise<void> {
    try {
      // If quantity is 0 or negative, remove the item
      if (quantity <= 0) {
        await this.removeItem(identifier, itemId);
        return;
      }

      // Determine if identifier is a user ID (UUID) or session ID
      const isUser = isUserId(identifier);

      // Get cart by appropriate identifier field
      const userCart = await db
        .select()
        .from(carts)
        .where(
          isUser
            ? eq(carts.userId, identifier)
            : eq(carts.sessionId, identifier)
        )
        .limit(1);

      if (userCart.length === 0) {
        throw new NotFoundError("Cart not found");
      }

      const cartId = userCart[0].id;

      // Get cart item with product details
      const cartItemData = await db
        .select({
          cartItem: cartItems,
          product: products,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(and(eq(cartItems.cartId, cartId), eq(cartItems.id, itemId)))
        .limit(1);

      if (cartItemData.length === 0) {
        throw new NotFoundError("Cart item not found");
      }

      const product = cartItemData[0].product;

      // Check stock
      if (product.stock < quantity) {
        throw new ValidationError(
          `Insufficient stock. Only ${product.stock} available`
        );
      }

      // Update quantity
      await db
        .update(cartItems)
        .set({
          quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, itemId));

      // Update cart last activity
      await db
        .update(carts)
        .set({ lastActivityAt: new Date(), updatedAt: new Date() })
        .where(eq(carts.id, cartId));
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      console.error("Error updating cart quantity:", error);
      throw new DatabaseError("Failed to update cart quantity");
    }
  },

  /**
   * Clear all items from cart
   * @param identifier - User ID for authenticated users or session ID for guests
   */
  async clearCart(identifier: string): Promise<void> {
    try {
      // Determine if identifier is a user ID (UUID) or session ID
      const isUser = isUserId(identifier);

      // Get cart by appropriate identifier field
      const userCart = await db
        .select()
        .from(carts)
        .where(
          isUser
            ? eq(carts.userId, identifier)
            : eq(carts.sessionId, identifier)
        )
        .limit(1);

      if (userCart.length === 0) {
        // No cart to clear
        return;
      }

      const cartId = userCart[0].id;

      // Delete all cart items
      await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

      // Update cart last activity
      await db
        .update(carts)
        .set({ lastActivityAt: new Date(), updatedAt: new Date() })
        .where(eq(carts.id, cartId));
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new DatabaseError("Failed to clear cart");
    }
  },

  // REMOVED: claimGuestCart - No longer needed with auto-signup flow
  // Guest carts are automatically cleared after checkout when user account is created

  /**
   * Validate cart items against current product data
   * Checks availability, stock, price changes, and variant combinations
   * @param items - Cart items to validate
   * @returns Validation result with errors
   */
  async validateCart(items: CartItem[]): Promise<ValidationResult> {
    const errors: CartItemValidation[] = [];

    try {
      for (const item of items) {
        // Get current product data
        const productData = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (productData.length === 0 || !productData[0].isActive) {
          // Product not found or inactive
          errors.push({
            itemId: item.id,
            valid: false,
            type: "PRODUCT_UNAVAILABLE",
            message: `${item.name} is no longer available`,
            suggestedAction: "REMOVE",
          });
          continue;
        }

        const currentProduct = productData[0];

        // NEW: Validate variant combination if variant selections exist
        if (
          item.variantSelections &&
          Object.keys(item.variantSelections).length > 0
        ) {
          const matchingProduct = await productService.findProductByVariants(
            item.productGroupId,
            item.variantSelections
          );

          if (!matchingProduct) {
            errors.push({
              itemId: item.id,
              valid: false,
              type: "PRODUCT_UNAVAILABLE",
              message: `${item.name} variant combination is no longer available`,
              suggestedAction: "REMOVE",
            });
            continue;
          }

          if (matchingProduct.id !== item.productId) {
            errors.push({
              itemId: item.id,
              valid: false,
              type: "PRODUCT_UNAVAILABLE",
              message: `${item.name} variant selections do not match product`,
              suggestedAction: "REMOVE",
            });
            continue;
          }
        }

        // Check stock
        if (currentProduct.stock < item.quantity) {
          errors.push({
            itemId: item.id,
            valid: false,
            type: "OUT_OF_STOCK",
            message: `${item.name} only has ${currentProduct.stock} items left`,
            suggestedAction: "UPDATE_QUANTITY",
            currentStock: currentProduct.stock,
          });
        }

        // Check price changes
        if (currentProduct.price !== item.price) {
          errors.push({
            itemId: item.id,
            valid: false,
            type: "PRICE_CHANGED",
            message: `Price for ${item.name} has changed`,
            suggestedAction: "UPDATE_PRICE",
            currentPrice: currentProduct.price,
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error("Error validating cart items:", error);
      throw new DatabaseError("Failed to validate cart items");
    }
  },

  /**
   * Validate session and cart association
   * Ensures the session ID exists and has an associated cart in the database
   * @param sessionId - Session ID to validate
   * @returns True if session has a valid cart, false otherwise
   */
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      // Check if cart exists for this session ID
      const userCart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);

      return userCart.length > 0;
    } catch (error) {
      console.error("Error validating session:", error);
      throw new DatabaseError("Failed to validate session");
    }
  },

  /**
   * Migrate guest cart to user cart on login
   * Merges guest cart items with existing user cart items
   * @param sessionId - Guest session ID
   * @param userId - Authenticated user ID
   */
  async migrateGuestCart(sessionId: string, userId: string): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Get guest cart by sessionId
        const [guestCart] = await tx
          .select()
          .from(carts)
          .where(eq(carts.sessionId, sessionId))
          .limit(1);

        if (!guestCart) {
          // No guest cart to migrate
          return;
        }

        // Get guest cart items
        const guestItems = await tx
          .select()
          .from(cartItems)
          .where(eq(cartItems.cartId, guestCart.id));

        if (guestItems.length === 0) {
          // No items to migrate, just delete guest cart
          await tx.delete(carts).where(eq(carts.id, guestCart.id));
          return;
        }

        // Get or create user cart
        let [userCart] = await tx
          .select()
          .from(carts)
          .where(eq(carts.userId, userId))
          .limit(1);

        if (!userCart) {
          // Create new cart for user
          [userCart] = await tx
            .insert(carts)
            .values({
              userId,
              sessionId: null,
              lastActivityAt: new Date(),
            })
            .returning();
        }

        // Get existing user cart items
        const userItems = await tx
          .select()
          .from(cartItems)
          .where(eq(cartItems.cartId, userCart.id));

        // Merge items - check for duplicates by productId and variantSelections
        for (const guestItem of guestItems) {
          const existingItem = userItems.find(
            (item) =>
              item.productId === guestItem.productId &&
              item.variantSelections === guestItem.variantSelections
          );

          if (existingItem) {
            // Item exists in both carts, sum quantities
            await tx
              .update(cartItems)
              .set({
                quantity: existingItem.quantity + guestItem.quantity,
                updatedAt: new Date(),
              })
              .where(eq(cartItems.id, existingItem.id));
          } else {
            // Item only in guest cart, add to user cart
            await tx.insert(cartItems).values({
              cartId: userCart.id,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
              variantSelections: guestItem.variantSelections,
            });
          }
        }

        // Delete guest cart items
        await tx.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));

        // Delete guest cart
        await tx.delete(carts).where(eq(carts.id, guestCart.id));

        // Update user cart last activity
        await tx
          .update(carts)
          .set({ lastActivityAt: new Date(), updatedAt: new Date() })
          .where(eq(carts.id, userCart.id));
      });
    } catch (error) {
      console.error("Error migrating guest cart:", error);
      throw new DatabaseError("Failed to migrate guest cart");
    }
  },
};
