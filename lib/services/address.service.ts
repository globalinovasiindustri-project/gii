import { db } from "@/lib/db/db";
import { addresses, SelectAddress, InsertAddress } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Input type for creating an address from checkout form data
 */
export type CreateAddressFromCheckoutInput = {
  userId: string;
  addressLabel: string;
  streetAddress: string;
  village: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  provinceCode?: string;
  regencyCode?: string;
  districtCode?: string;
  villageCode?: string;
};

export const addressService = {
  /**
   * Get all addresses for a user, ordered by default flag first, then by creation date descending
   */
  getUserAddresses: async (userId: string): Promise<SelectAddress[]> => {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  },

  /**
   * Get address by ID with user ownership validation
   */
  getAddressById: async (
    addressId: string,
    userId: string
  ): Promise<SelectAddress | null> => {
    const result = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    return result[0] || null;
  },

  /**
   * Get default address for quick default lookup
   */
  getDefaultAddress: async (userId: string): Promise<SelectAddress | null> => {
    const result = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)))
      .limit(1);

    return result[0] || null;
  },

  /**
   * Create new address with automatic default handling for first address
   */
  createAddress: async (
    userId: string,
    data: Omit<InsertAddress, "userId" | "id" | "createdAt" | "updatedAt">
  ): Promise<SelectAddress> => {
    return await db.transaction(async (tx) => {
      // Check if this is the user's first address
      const existingAddresses = await tx
        .select()
        .from(addresses)
        .where(eq(addresses.userId, userId));

      const isFirstAddress = existingAddresses.length === 0;
      const shouldBeDefault = isFirstAddress || data.isDefault;

      // If setting as default, unset other defaults
      if (shouldBeDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(addresses.userId, userId));
      }

      // Create new address
      const [newAddress] = await tx
        .insert(addresses)
        .values({
          ...data,
          userId,
          isDefault: shouldBeDefault,
        })
        .returning();

      return newAddress;
    });
  },

  /**
   * Update address with default flag management
   */
  updateAddress: async (
    addressId: string,
    userId: string,
    data: Partial<
      Omit<InsertAddress, "userId" | "id" | "createdAt" | "updatedAt">
    >
  ): Promise<SelectAddress | null> => {
    return await db.transaction(async (tx) => {
      // Verify ownership
      const existing = await tx
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
        .limit(1);

      if (!existing[0]) return null;

      // If setting as default, unset other defaults
      if (data.isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(
              eq(addresses.userId, userId),
              sql`${addresses.id} != ${addressId}`
            )
          );
      }

      // Update address
      const [updated] = await tx
        .update(addresses)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(addresses.id, addressId))
        .returning();

      return updated;
    });
  },

  /**
   * Delete address with automatic default reassignment
   */
  deleteAddress: async (
    addressId: string,
    userId: string
  ): Promise<boolean> => {
    return await db.transaction(async (tx) => {
      // Verify ownership
      const existing = await tx
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
        .limit(1);

      if (!existing[0]) return false;

      const wasDefault = existing[0].isDefault;

      // Delete address
      await tx.delete(addresses).where(eq(addresses.id, addressId));

      // If deleted address was default, set another as default
      if (wasDefault) {
        const remaining = await tx
          .select()
          .from(addresses)
          .where(eq(addresses.userId, userId))
          .orderBy(desc(addresses.createdAt))
          .limit(1);

        if (remaining[0]) {
          await tx
            .update(addresses)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(addresses.id, remaining[0].id));
        }
      }

      return true;
    });
  },

  /**
   * Set address as default with transaction safety
   */
  setDefaultAddress: async (
    addressId: string,
    userId: string
  ): Promise<boolean> => {
    return await db.transaction(async (tx) => {
      // Verify ownership
      const existing = await tx
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
        .limit(1);

      if (!existing[0]) return false;

      // Unset all defaults for this user
      await tx
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(addresses.userId, userId));

      // Set this address as default
      await tx
        .update(addresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(addresses.id, addressId));

      return true;
    });
  },

  /**
   * Create address from checkout form data
   * Automatically sets as default if it's the user's first address
   * Handles optional wilayah.id location codes
   */
  createAddressFromCheckout: async (
    input: CreateAddressFromCheckoutInput
  ): Promise<SelectAddress> => {
    const {
      userId,
      addressLabel,
      streetAddress,
      village,
      district,
      city,
      state,
      postalCode,
      provinceCode,
      regencyCode,
      districtCode,
      villageCode,
    } = input;

    return await db.transaction(async (tx) => {
      // Check if this is the user's first address
      const existingAddresses = await tx
        .select()
        .from(addresses)
        .where(eq(addresses.userId, userId));

      const isFirstAddress = existingAddresses.length === 0;

      // Create new address with checkout data
      const [newAddress] = await tx
        .insert(addresses)
        .values({
          userId,
          addressLabel,
          streetAddress,
          village,
          district,
          city,
          state,
          postalCode,
          provinceCode: provinceCode ?? null,
          regencyCode: regencyCode ?? null,
          districtCode: districtCode ?? null,
          villageCode: villageCode ?? null,
          isDefault: isFirstAddress,
        })
        .returning();

      return newAddress;
    });
  },
};
