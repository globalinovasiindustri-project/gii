import { db } from "../db/db";
import {
  and,
  eq,
  inArray,
  ilike,
  sql,
  type SQL,
  gte,
  lte,
  asc,
  desc,
} from "drizzle-orm";
import {
  productGroups,
  productVariants,
  products,
  productVariantCombinations,
  type SelectProductGroup,
  type SelectProductVariant,
  type SelectProduct,
} from "../db/schema";
import { CompleteProduct, ProductFilters } from "@/hooks/use-products";
import { UserRole } from "../enums";
import { hasPermission } from "../utils/permissions";
import { generateSlug } from "../utils/product.utils";
import type { ValidVariantCombinations } from "../types/product.types";

type WhereCondition = SQL<unknown> | undefined;
type VariantSelection = Record<string, string>;

// === Service Layer Types ===

export interface CreateProductData {
  name: string;
  category: string;
  brand: string;
  description?: string;
  weight?: number;
  isActive: boolean;
  isHighlighted?: boolean;
  additionalDescriptions?: Array<{ title: string; body: string }>;
  images?: Array<{ url: string; isThumbnail: boolean }>;
  hasVariants: boolean;
  variantTypes: string[];
  combinations: Array<{
    variants: Record<string, string>;
    sku: string;
    name?: string;
    price: number;
    stock: number;
    active: boolean;
  }>;
}

export type UpdateProductData = CreateProductData;

export interface CompleteProductResult {
  productGroup: SelectProductGroup;
  products: SelectProduct[];
}

// === Permission Configuration ===
const PERMISSIONS = {
  user: { canViewInactive: false },
  admin: { canViewInactive: true },
  super_admin: { canViewInactive: true },
} as const;

// === Query Filter Builders ===

// Filters based on user input (search, category, brand, etc.)
function createUserInputFilters(filters: ProductFilters): WhereCondition[] {
  const conditions: WhereCondition[] = [];

  if (filters.category) {
    conditions.push(eq(productGroups.category, filters.category));
  }

  if (filters.brand) {
    conditions.push(eq(productGroups.brand, filters.brand));
  }

  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    conditions.push(ilike(productGroups.name, searchTerm));
  }

  return conditions;
}

// Create price filter conditions for product groups
// Note: Price filtering requires joining with products table, so this is handled separately
function createPriceFilters(filters: ProductFilters): {
  minPrice?: number;
  maxPrice?: number;
} {
  return {
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };
}

// Filters based on user role permissions (isActive visibility)
function createRoleBasedFilters(
  filters: ProductFilters,
  role: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [];

  if (typeof filters.isActive === "boolean") {
    const activeValue = hasPermission(role, PERMISSIONS, "canViewInactive")
      ? filters.isActive
      : true;
    conditions.push(eq(productGroups.isActive, activeValue));
  } else {
    if (!hasPermission(role, PERMISSIONS, "canViewInactive")) {
      conditions.push(eq(productGroups.isActive, true));
    }
  }

  return conditions;
}

function createVariantFilters(
  groupIds: string[],
  role: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(productVariants.productGroupId, groupIds),
  ];

  if (!hasPermission(role, PERMISSIONS, "canViewInactive")) {
    conditions.push(eq(productVariants.isActive, true));
  }

  return conditions;
}

function createProductFilters(
  groupIds: string[],
  role: UserRole
): WhereCondition[] {
  const conditions: WhereCondition[] = [
    inArray(products.productGroupId, groupIds),
  ];

  if (!hasPermission(role, PERMISSIONS, "canViewInactive")) {
    conditions.push(eq(products.isActive, true));
  }

  return conditions;
}

// === Database Queries ===
async function getProductGroups(
  conditions: WhereCondition[],
  sortBy?: "newest" | "random" | "price-low" | "price-high" | "popularity",
  limit?: number,
  offset?: number
): Promise<SelectProductGroup[]> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  let query = db.select().from(productGroups);

  if (validConditions.length > 0) {
    query = query.where(and(...validConditions)) as typeof query;
  }

  // Apply sorting
  if (sortBy === "random") {
    query = query.orderBy(sql`RANDOM()`) as typeof query;
  } else if (sortBy === "newest") {
    query = query.orderBy(sql`${productGroups.createdAt} DESC`) as typeof query;
  } else if (sortBy === "popularity") {
    query = query.orderBy(
      sql`${productGroups.isHighlighted} DESC`,
      sql`RANDOM()`
    ) as typeof query;
  }
  // Note: price-low and price-high sorting will be handled in the main service method
  // because it requires joining with the products table

  // Apply pagination
  if (limit !== undefined) {
    query = query.limit(limit) as typeof query;
  }
  if (offset !== undefined) {
    query = query.offset(offset) as typeof query;
  }

  return await query;
}

async function getProductGroupsWithPrice(
  conditions: WhereCondition[],
  sortBy?: "newest" | "random" | "price-low" | "price-high" | "popularity",
  limit?: number,
  offset?: number
): Promise<SelectProductGroup[]> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  // Create a subquery to get minimum price per product group
  const priceSubquery = db
    .select({
      productGroupId: products.productGroupId,
      minPrice: sql<number>`MIN(${products.price})`.as("min_price"),
    })
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isDeleted, false)))
    .groupBy(products.productGroupId)
    .as("price_data");

  // Build the main query with join
  let query = db
    .select({
      id: productGroups.id,
      name: productGroups.name,
      slug: productGroups.slug,
      category: productGroups.category,
      brand: productGroups.brand,
      description: productGroups.description,
      weight: productGroups.weight,
      additionalDescriptions: productGroups.additionalDescriptions,
      images: productGroups.images,
      isHighlighted: productGroups.isHighlighted,
      isActive: productGroups.isActive,
      isDeleted: productGroups.isDeleted,
      createdAt: productGroups.createdAt,
      updatedAt: productGroups.updatedAt,
      minPrice: priceSubquery.minPrice,
    })
    .from(productGroups)
    .leftJoin(
      priceSubquery,
      eq(productGroups.id, priceSubquery.productGroupId)
    );

  if (validConditions.length > 0) {
    query = query.where(and(...validConditions)) as typeof query;
  }

  // Apply sorting
  if (sortBy === "price-low") {
    query = query.orderBy(asc(priceSubquery.minPrice)) as typeof query;
  } else if (sortBy === "price-high") {
    query = query.orderBy(desc(priceSubquery.minPrice)) as typeof query;
  } else if (sortBy === "popularity") {
    query = query.orderBy(
      desc(productGroups.isHighlighted),
      sql`RANDOM()`
    ) as typeof query;
  } else if (sortBy === "random") {
    query = query.orderBy(sql`RANDOM()`) as typeof query;
  } else {
    // Default to newest
    query = query.orderBy(desc(productGroups.createdAt)) as typeof query;
  }

  // Apply pagination
  if (limit !== undefined) {
    query = query.limit(limit) as typeof query;
  }
  if (offset !== undefined) {
    query = query.offset(offset) as typeof query;
  }

  const results = await query;

  // Remove the minPrice field from results as it's not part of SelectProductGroup
  return results.map(({ minPrice, ...group }) => group as SelectProductGroup);
}

async function countProductGroups(
  conditions: WhereCondition[]
): Promise<number> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  let query = db
    .select({ count: sql<number>`COUNT(*)`.as("count") })
    .from(productGroups);

  if (validConditions.length > 0) {
    query = query.where(and(...validConditions)) as typeof query;
  }

  const result = await query;
  return result[0]?.count || 0;
}

async function getVariants(
  conditions: WhereCondition[]
): Promise<SelectProductVariant[]> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  if (validConditions.length === 0) return [];

  return await db
    .select()
    .from(productVariants)
    .where(and(...validConditions));
}

async function getProductsList(
  conditions: WhereCondition[]
): Promise<SelectProduct[]> {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  if (validConditions.length === 0) return [];

  return await db
    .select()
    .from(products)
    .where(and(...validConditions));
}

async function getVariantCombinations(productIds: string[]) {
  if (productIds.length === 0) return [];

  return await db
    .select()
    .from(productVariantCombinations)
    .where(inArray(productVariantCombinations.productId, productIds));
}

// === Data Grouping Utilities ===
function groupBy<T extends { id: string }>(
  items: T[],
  getKey: (item: T) => string
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const existing = grouped.get(key) ?? [];
    grouped.set(key, [...existing, item]);
  }

  return grouped;
}

function createVariantSelections(
  combinations: Array<{ productId: string; variantId: string }>,
  variants: SelectProductVariant[]
): Map<string, VariantSelection> {
  const variantsMap = new Map(variants.map((v) => [v.id, v]));
  const selectionsMap = new Map<string, VariantSelection>();

  for (const combo of combinations) {
    const variant = variantsMap.get(combo.variantId);
    if (!variant) continue;

    const selections = selectionsMap.get(combo.productId) ?? {};
    selections[variant.variant] = variant.value;
    selectionsMap.set(combo.productId, selections);
  }

  return selectionsMap;
}

// === Main Assembly ===
function assembleCompleteProducts(
  groups: Array<
    SelectProductGroup & {
      images?: Array<{ url: string; isThumbnail: boolean }>;
    }
  >,
  variantsByGroup: Map<string, SelectProductVariant[]>,
  productsByGroup: Map<string, SelectProduct[]>,
  variantSelections: Map<string, VariantSelection>
): CompleteProduct[] {
  return groups.map((group) => {
    const groupProducts = productsByGroup.get(group.id) ?? [];

    return {
      productGroup: group,
      variants: variantsByGroup.get(group.id) ?? [],
      products: groupProducts,
      variantSelectionsByProductId: Object.fromEntries(
        groupProducts.map((p) => [p.id, variantSelections.get(p.id) ?? {}])
      ),
    };
  });
}

// === Main Service ===
export const productService = {
  async getProductGroups(
    filters: ProductFilters,
    viewerRole: UserRole
  ): Promise<{
    products: CompleteProduct[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Step 1: Apply user input filters (search, category, brand)
    const userInputFilters = createUserInputFilters(filters);

    // Step 2: Apply role-based filters (isActive visibility based on permissions)
    const roleBasedFilters = createRoleBasedFilters(filters, viewerRole);

    // Step 3: Combine all filters
    const finalFilters = [...userInputFilters, ...roleBasedFilters];

    // Step 4: Extract price filters
    const priceFilters = createPriceFilters(filters);

    // Step 5: Calculate pagination parameters
    const limit = filters.limit || 12;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    // Step 6: Get total count for pagination (before applying limit/offset)
    const totalCount = await countProductGroups(finalFilters);
    const totalPages = Math.ceil(totalCount / limit);

    // If no results, return early
    if (totalCount === 0) {
      return {
        products: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Step 7: Determine if we need price-based sorting or filtering
    const needsPriceQuery =
      filters.sortBy === "price-low" ||
      filters.sortBy === "price-high" ||
      priceFilters.minPrice !== undefined ||
      priceFilters.maxPrice !== undefined;

    let fetchedProductGroups: SelectProductGroup[];

    if (needsPriceQuery) {
      // Use the query that joins with products table for price data
      // We need to apply price filters in a subquery
      if (
        priceFilters.minPrice !== undefined ||
        priceFilters.maxPrice !== undefined
      ) {
        // Create a subquery to get product groups that have products within price range
        const priceFilterSubquery = db
          .select({
            productGroupId: products.productGroupId,
          })
          .from(products)
          .where(
            and(
              eq(products.isActive, true),
              eq(products.isDeleted, false),
              priceFilters.minPrice !== undefined
                ? gte(products.price, priceFilters.minPrice)
                : undefined,
              priceFilters.maxPrice !== undefined
                ? lte(products.price, priceFilters.maxPrice)
                : undefined
            )
          )
          .groupBy(products.productGroupId)
          .as("price_filtered_groups");

        // Add filter to only include product groups that have products in price range
        const priceFilterCondition = sql`${productGroups.id} IN (SELECT ${priceFilterSubquery.productGroupId} FROM ${priceFilterSubquery})`;
        finalFilters.push(priceFilterCondition);
      }

      fetchedProductGroups = await getProductGroupsWithPrice(
        finalFilters,
        filters.sortBy,
        limit,
        offset
      );
    } else {
      // Use the simpler query without price joins
      fetchedProductGroups = await getProductGroups(
        finalFilters,
        filters.sortBy,
        limit,
        offset
      );
    }

    if (fetchedProductGroups.length === 0) {
      return {
        products: [],
        totalCount,
        page,
        limit,
        totalPages,
      };
    }

    // Step 8: Parse additional descriptions and images from JSON
    const parsedProductGroups = fetchedProductGroups.map((group) => {
      const parsed = {
        ...group,
        additionalDescriptions: group.additionalDescriptions
          ? JSON.parse(group.additionalDescriptions)
          : [],
      };

      // Parse images and override the type
      const images: Array<{ url: string; isThumbnail: boolean }> | undefined =
        group.images ? JSON.parse(group.images) : undefined;

      return {
        ...parsed,
        images,
      };
    });

    // Step 9: Extract group IDs for subsequent queries
    const groupIds = parsedProductGroups.map((g) => g.id);

    // Step 10: Build filters for variants and products (with role-based restrictions)
    const variantFilters = createVariantFilters(groupIds, viewerRole);
    const productFilters = createProductFilters(groupIds, viewerRole);

    // Step 11: Fetch variants and products in parallel
    const [variants, productsList] = await Promise.all([
      getVariants(variantFilters),
      getProductsList(productFilters),
    ]);

    // Step 12: Group data by product group ID
    const variantsByGroup = groupBy(variants, (v) => v.productGroupId);
    const productsByGroup = groupBy(productsList, (p) => p.productGroupId);

    // Step 13: Fetch variant combinations
    const productIds = productsList.map((p) => p.id);
    const combinations = await getVariantCombinations(productIds);

    // Step 14: Create variant selections map
    const variantSelections = createVariantSelections(combinations, variants);

    // Step 15: Assemble final result
    const completeProducts = assembleCompleteProducts(
      parsedProductGroups as Array<
        SelectProductGroup & {
          images?: Array<{ url: string; isThumbnail: boolean }>;
        }
      >,
      variantsByGroup,
      productsByGroup,
      variantSelections
    );

    return {
      products: completeProducts,
      totalCount,
      page,
      limit,
      totalPages,
    };
  },

  async getProductGroupBySlug(
    slug: string,
    viewerRole: UserRole
  ): Promise<CompleteProduct | null> {
    // Step 1: Direct database query by slug with isActive and isDeleted filters
    const fetchedProductGroups = await db
      .select()
      .from(productGroups)
      .where(
        and(
          eq(productGroups.slug, slug),
          eq(productGroups.isActive, true),
          eq(productGroups.isDeleted, false)
        )
      )
      .limit(1);

    if (fetchedProductGroups.length === 0) return null;

    // Step 2: Parse JSON fields (additionalDescriptions, images)
    const group = fetchedProductGroups[0];
    const parsedGroup = {
      ...group,
      additionalDescriptions: group.additionalDescriptions
        ? JSON.parse(group.additionalDescriptions)
        : [],
    };

    // Parse images and override the type
    const images: Array<{ url: string; isThumbnail: boolean }> | undefined =
      group.images ? JSON.parse(group.images) : undefined;

    const parsedGroupWithImages = {
      ...parsedGroup,
      images,
    };

    // Step 3: Fetch related variants, products, and combinations
    const groupIds = [group.id];

    // Build filters for variants and products (with role-based restrictions)
    const variantFilters = createVariantFilters(groupIds, viewerRole);
    const productFilters = createProductFilters(groupIds, viewerRole);

    // Fetch variants and products in parallel
    const [variants, productsList] = await Promise.all([
      getVariants(variantFilters),
      getProductsList(productFilters),
    ]);

    // Step 4: Fetch variant combinations
    const productIds = productsList.map((p) => p.id);
    const combinations = await getVariantCombinations(productIds);

    // Step 5: Create variant selections map
    const variantSelections = createVariantSelections(combinations, variants);

    // Step 6: Return CompleteProduct
    return {
      productGroup: parsedGroupWithImages as SelectProductGroup & {
        images?: Array<{ url: string; isThumbnail: boolean }>;
      },
      variants: variants,
      products: productsList,
      variantSelectionsByProductId: Object.fromEntries(
        productsList.map((p) => [p.id, variantSelections.get(p.id) ?? {}])
      ),
    };
  },

  async createProductGroup(data: {
    name: string;
    category: string;
    brand: string;
    description?: string;
    weight?: number;
    isActive: boolean;
    isHighlighted?: boolean;
    additionalDescriptions?: Array<{ title: string; body: string }>;
    images?: Array<{ url: string; isThumbnail: boolean }>;
  }): Promise<SelectProductGroup> {
    try {
      const additionalDescriptionsJson =
        data.additionalDescriptions && data.additionalDescriptions.length > 0
          ? JSON.stringify(data.additionalDescriptions)
          : null;

      const imagesJson =
        data.images && data.images.length > 0
          ? JSON.stringify(data.images)
          : null;

      const slug = generateSlug(data.name);

      const [productGroup] = await db
        .insert(productGroups)
        .values({
          name: data.name,
          slug: slug,
          category: data.category,
          brand: data.brand,
          description: data.description,
          weight: data.weight,
          isActive: data.isActive,
          isHighlighted: data.isHighlighted ?? false,
          additionalDescriptions: additionalDescriptionsJson,
          images: imagesJson,
        })
        .returning();

      return productGroup;
    } catch (error) {
      console.error("Error creating product group:", error);
      throw new Error(
        `Gagal membuat grup produk: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async updateProductGroup(
    id: string,
    data: Partial<{
      name: string;
      category: string;
      brand: string;
      description?: string;
      weight?: number;
      isActive: boolean;
      isHighlighted?: boolean;
      additionalDescriptions?: Array<{ title: string; body: string }>;
      images?: Array<{ url: string; isThumbnail: boolean }>;
    }>
  ): Promise<SelectProductGroup> {
    try {
      const updateData: Partial<typeof productGroups.$inferInsert> = {};

      // Copy all fields except additionalDescriptions and images
      if (data.name !== undefined) {
        updateData.name = data.name;
        updateData.slug = generateSlug(data.name);
      }
      if (data.category !== undefined) updateData.category = data.category;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isHighlighted !== undefined)
        updateData.isHighlighted = data.isHighlighted;

      // Handle additionalDescriptions conversion to JSON
      if (data.additionalDescriptions !== undefined) {
        updateData.additionalDescriptions =
          data.additionalDescriptions.length > 0
            ? JSON.stringify(data.additionalDescriptions)
            : null;
      }

      // Handle images conversion to JSON
      if (data.images !== undefined) {
        updateData.images =
          data.images.length > 0 ? JSON.stringify(data.images) : null;
      }

      const [updated] = await db
        .update(productGroups)
        .set(updateData)
        .where(eq(productGroups.id, id))
        .returning();

      if (!updated) {
        throw new Error("Product group not found");
      }

      return updated;
    } catch (error) {
      console.error("Error updating product group:", error);
      throw new Error(
        `Gagal memperbarui grup produk: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async createCompleteProduct(
    data: CreateProductData
  ): Promise<CompleteProductResult> {
    try {
      return await db.transaction(async (tx) => {
        // Step 1: Create product group
        const slug = generateSlug(data.name);

        const [productGroup] = await tx
          .insert(productGroups)
          .values({
            name: data.name,
            slug: slug,
            category: data.category,
            brand: data.brand,
            description: data.description,
            weight: data.weight,
            isActive: data.isActive,
            isHighlighted: data.isHighlighted ?? false,
            additionalDescriptions:
              data.additionalDescriptions &&
              data.additionalDescriptions.length > 0
                ? JSON.stringify(data.additionalDescriptions)
                : null,
            images:
              data.images && data.images.length > 0
                ? JSON.stringify(data.images)
                : null,
          })
          .returning();

        // Step 2: Create variants if hasVariants
        const createdVariants: Map<string, Map<string, string>> = new Map();

        if (data.hasVariants && data.variantTypes.length > 0) {
          // Collect unique variant values for each type
          const variantValuesByType = new Map<string, Set<string>>();

          for (const combination of data.combinations) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              if (!variantValuesByType.has(variantType)) {
                variantValuesByType.set(variantType, new Set());
              }
              variantValuesByType.get(variantType)!.add(variantValue);
            }
          }

          // Create variant records
          for (const [variantType, values] of variantValuesByType.entries()) {
            const typeMap = new Map<string, string>();

            for (const value of values) {
              const [variant] = await tx
                .insert(productVariants)
                .values({
                  productGroupId: productGroup.id,
                  variant: variantType,
                  value: value,
                  isActive: true,
                })
                .returning();

              typeMap.set(value, variant.id);
            }

            createdVariants.set(variantType, typeMap);
          }
        }

        // Step 3: Create products (combinations)
        const createdProducts = [];

        for (const combination of data.combinations) {
          const productName =
            combination.name && combination.name.trim() !== ""
              ? combination.name
              : data.name;

          const [product] = await tx
            .insert(products)
            .values({
              productGroupId: productGroup.id,
              sku: combination.sku,
              name: productName,
              price: combination.price,
              stock: combination.stock,
              isActive: combination.active,
            })
            .returning();

          createdProducts.push(product);

          // Step 4: Create variant combinations if variants exist
          if (
            data.hasVariants &&
            Object.keys(combination.variants).length > 0
          ) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              const variantId = createdVariants
                .get(variantType)
                ?.get(variantValue);

              if (variantId) {
                await tx.insert(productVariantCombinations).values({
                  productId: product.id,
                  variantId: variantId,
                });
              }
            }
          }
        }

        return {
          productGroup,
          products: createdProducts,
        };
      });
    } catch (error) {
      console.error("Error creating complete product:", error);
      throw new Error(
        `Gagal membuat produk lengkap: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async updateCompleteProduct(
    id: string,
    data: UpdateProductData
  ): Promise<CompleteProductResult> {
    try {
      return await db.transaction(async (tx) => {
        // Step 1: Update product group
        const slug = generateSlug(data.name);

        const [productGroup] = await tx
          .update(productGroups)
          .set({
            name: data.name,
            slug: slug,
            category: data.category,
            brand: data.brand,
            description: data.description,
            weight: data.weight,
            isActive: data.isActive,
            isHighlighted: data.isHighlighted ?? false,
            additionalDescriptions:
              data.additionalDescriptions &&
              data.additionalDescriptions.length > 0
                ? JSON.stringify(data.additionalDescriptions)
                : null,
            images:
              data.images && data.images.length > 0
                ? JSON.stringify(data.images)
                : null,
            updatedAt: new Date(),
          })
          .where(eq(productGroups.id, id))
          .returning();

        if (!productGroup) {
          throw new Error("Product group not found");
        }

        // Step 2: Delete existing data
        // Get existing products first
        const existingProducts = await tx
          .select()
          .from(products)
          .where(eq(products.productGroupId, id));

        const existingProductIds = existingProducts.map((p) => p.id);

        if (existingProductIds.length > 0) {
          // Delete variant combinations
          await tx
            .delete(productVariantCombinations)
            .where(
              inArray(productVariantCombinations.productId, existingProductIds)
            );
        }

        // Delete products
        await tx.delete(products).where(eq(products.productGroupId, id));

        // Delete variants
        await tx
          .delete(productVariants)
          .where(eq(productVariants.productGroupId, id));

        // Step 3: Recreate variants if hasVariants
        const createdVariants: Map<string, Map<string, string>> = new Map();

        if (data.hasVariants && data.variantTypes.length > 0) {
          // Collect unique variant values for each type
          const variantValuesByType = new Map<string, Set<string>>();

          for (const combination of data.combinations) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              if (!variantValuesByType.has(variantType)) {
                variantValuesByType.set(variantType, new Set());
              }
              variantValuesByType.get(variantType)!.add(variantValue);
            }
          }

          // Create variant records
          for (const [variantType, values] of variantValuesByType.entries()) {
            const typeMap = new Map<string, string>();

            for (const value of values) {
              const [variant] = await tx
                .insert(productVariants)
                .values({
                  productGroupId: id,
                  variant: variantType,
                  value: value,
                  isActive: true,
                })
                .returning();

              typeMap.set(value, variant.id);
            }

            createdVariants.set(variantType, typeMap);
          }
        }

        // Step 4: Recreate products (combinations)
        const createdProducts = [];

        for (const combination of data.combinations) {
          const productName =
            combination.name && combination.name.trim() !== ""
              ? combination.name
              : data.name;

          const [product] = await tx
            .insert(products)
            .values({
              productGroupId: id,
              sku: combination.sku,
              name: productName,
              price: combination.price,
              stock: combination.stock,
              isActive: combination.active,
            })
            .returning();

          createdProducts.push(product);

          // Step 5: Recreate variant combinations if variants exist
          if (
            data.hasVariants &&
            Object.keys(combination.variants).length > 0
          ) {
            for (const [variantType, variantValue] of Object.entries(
              combination.variants
            )) {
              const variantId = createdVariants
                .get(variantType)
                ?.get(variantValue);

              if (variantId) {
                await tx.insert(productVariantCombinations).values({
                  productId: product.id,
                  variantId: variantId,
                });
              }
            }
          }
        }

        return {
          productGroup,
          products: createdProducts,
        };
      });
    } catch (error) {
      console.error("Error updating complete product:", error);
      throw new Error(
        `Gagal memperbarui produk lengkap: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },

  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const result = await db
      .select({
        name: productGroups.category,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(productGroups)
      .where(
        and(
          eq(productGroups.isActive, true),
          eq(productGroups.isDeleted, false)
        )
      )
      .groupBy(productGroups.category)
      .orderBy(productGroups.category);

    return result;
  },

  async getBrands(): Promise<Array<{ name: string; count: number }>> {
    const result = await db
      .select({
        name: productGroups.brand,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(productGroups)
      .where(
        and(
          eq(productGroups.isActive, true),
          eq(productGroups.isDeleted, false)
        )
      )
      .groupBy(productGroups.brand)
      .orderBy(productGroups.brand);

    return result;
  },

  async getPriceRange(): Promise<{ min: number; max: number }> {
    const result = await db
      .select({
        min: sql<number>`MIN(${products.price})`.as("min_price"),
        max: sql<number>`MAX(${products.price})`.as("max_price"),
      })
      .from(products)
      .innerJoin(productGroups, eq(products.productGroupId, productGroups.id))
      .where(
        and(
          eq(products.isActive, true),
          eq(products.isDeleted, false),
          eq(productGroups.isActive, true),
          eq(productGroups.isDeleted, false)
        )
      );

    return result[0] || { min: 0, max: 0 };
  },

  /**
   * Get all valid variant combinations for a product group
   * Returns structured data with variant types, combinations, and availability map
   */
  async getValidVariantCombinations(productGroupId: string): Promise<{
    variantTypes: string[];
    combinations: Array<{
      productId: string;
      variants: Record<string, string>;
      price: number;
      stock: number;
      isActive: boolean;
    }>;
    availabilityMap: Record<string, Record<string, boolean>>;
  }> {
    // Step 1: Get all active products for this product group
    const productsList = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.productGroupId, productGroupId),
          eq(products.isActive, true),
          eq(products.isDeleted, false)
        )
      );

    // If no products, return empty structure
    if (productsList.length === 0) {
      return {
        variantTypes: [],
        combinations: [],
        availabilityMap: {},
      };
    }

    // Step 2: Get all variant combinations for these products
    const productIds = productsList.map((p) => p.id);
    const combinations = await db
      .select()
      .from(productVariantCombinations)
      .where(inArray(productVariantCombinations.productId, productIds));

    // If no combinations, this is a product without variants
    if (combinations.length === 0) {
      return {
        variantTypes: [],
        combinations: productsList.map((p) => ({
          productId: p.id,
          variants: {},
          price: p.price,
          stock: p.stock,
          isActive: p.isActive,
        })),
        availabilityMap: {},
      };
    }

    // Step 3: Get variant details
    const variantIds = combinations.map((c) => c.variantId);
    const variants = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    // Step 4: Build variant selections map (productId -> variants)
    const variantsMap = new Map(variants.map((v) => [v.id, v]));
    const variantSelectionsByProduct = new Map<
      string,
      Record<string, string>
    >();

    for (const combo of combinations) {
      const variant = variantsMap.get(combo.variantId);
      if (!variant) continue;

      const selections = variantSelectionsByProduct.get(combo.productId) ?? {};
      selections[variant.variant] = variant.value;
      variantSelectionsByProduct.set(combo.productId, selections);
    }

    // Step 5: Build structured response
    const variantTypesSet = new Set<string>();
    const combinationsResult = productsList.map((product) => {
      const variantSelections =
        variantSelectionsByProduct.get(product.id) ?? {};

      // Track variant types
      Object.keys(variantSelections).forEach((type) =>
        variantTypesSet.add(type)
      );

      return {
        productId: product.id,
        variants: variantSelections,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
      };
    });

    const variantTypes = Array.from(variantTypesSet).sort();

    // Step 6: Build availability map
    // For each variant type, track which values are available (have stock > 0)
    const availabilityMap: Record<string, Record<string, boolean>> = {};

    for (const variantType of variantTypes) {
      availabilityMap[variantType] = {};

      for (const combo of combinationsResult) {
        const value = combo.variants[variantType];
        if (value) {
          // Mark as available if at least one combination with this value has stock
          if (combo.stock > 0) {
            availabilityMap[variantType][value] = true;
          } else if (availabilityMap[variantType][value] === undefined) {
            // Only set to false if not already set to true
            availabilityMap[variantType][value] = false;
          }
        }
      }
    }

    return {
      variantTypes,
      combinations: combinationsResult,
      availabilityMap,
    };
  },

  /**
   * Find exact product by product group ID and variant selections
   * Returns product with stock and active status, or null if no match
   */
  async findProductByVariants(
    productGroupId: string,
    variantSelections: Record<string, string>
  ): Promise<SelectProduct | null> {
    // Handle edge case: empty variant selections
    if (Object.keys(variantSelections).length === 0) {
      // Try to find a product without variants
      const productsList = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.productGroupId, productGroupId),
            eq(products.isActive, true),
            eq(products.isDeleted, false)
          )
        )
        .limit(1);

      return productsList[0] ?? null;
    }

    // Step 1: Get all active products for this product group
    const productsList = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.productGroupId, productGroupId),
          eq(products.isActive, true),
          eq(products.isDeleted, false)
        )
      );

    if (productsList.length === 0) {
      return null;
    }

    // Step 2: Get all variant combinations for these products
    const productIds = productsList.map((p) => p.id);
    const combinations = await db
      .select()
      .from(productVariantCombinations)
      .where(inArray(productVariantCombinations.productId, productIds));

    if (combinations.length === 0) {
      return null;
    }

    // Step 3: Get variant details
    const variantIds = combinations.map((c) => c.variantId);
    const variants = await db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    // Step 4: Build variant selections map for each product
    const variantsMap = new Map(variants.map((v) => [v.id, v]));
    const variantSelectionsByProduct = new Map<
      string,
      Record<string, string>
    >();

    for (const combo of combinations) {
      const variant = variantsMap.get(combo.variantId);
      if (!variant) continue;

      const selections = variantSelectionsByProduct.get(combo.productId) ?? {};
      selections[variant.variant] = variant.value;
      variantSelectionsByProduct.set(combo.productId, selections);
    }

    // Step 5: Find exact match
    for (const product of productsList) {
      const productVariants = variantSelectionsByProduct.get(product.id) ?? {};

      // Check if this product's variants match the requested selections exactly
      const variantKeys = Object.keys(variantSelections);
      const productVariantKeys = Object.keys(productVariants);

      // Must have same number of variant types
      if (variantKeys.length !== productVariantKeys.length) {
        continue;
      }

      // Check if all variant selections match
      const isMatch = variantKeys.every(
        (key) => productVariants[key] === variantSelections[key]
      );

      if (isMatch) {
        return product;
      }
    }

    return null;
  },
};
