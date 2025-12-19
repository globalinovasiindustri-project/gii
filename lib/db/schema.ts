import {
  integer,
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Role options (using text field with TypeScript constants for type safety)
export const roleOptions = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = (typeof roleOptions)[keyof typeof roleOptions];

// Order status options
export const orderStatusOptions = {
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

// Payment status options
export const paymentStatusOptions = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default(roleOptions.USER),
  isConfirmed: boolean("is_confirmed").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// Verify table
export const verifyCodes = pgTable("verify_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  verifyType: text("verify_type").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertVerifyCode = typeof verifyCodes.$inferInsert;
export type SelectVerifyCode = typeof verifyCodes.$inferSelect;

// Product Group Table (Template/Base Product)
export const productGroups = pgTable("product_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  description: text("description"), // Optional: deskripsi produk
  // Berat berpindah ke level product group
  weight: integer("weight"), // Optional: berat dalam gram untuk shipping
  additionalDescriptions: text("additional_descriptions"), // Optional: JSON array of additional description items
  images: text("images"), // Optional: JSON array of image objects with url and isThumbnail
  isHighlighted: boolean("is_highlighted").notNull().default(false), // Featured product flag
  isActive: boolean("is_active").notNull().default(true),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertProductGroup = typeof productGroups.$inferInsert;
export type SelectProductGroup = typeof productGroups.$inferSelect;

// Product Variant Table (Available variant options per product group)
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productGroupId: uuid("product_group_id")
      .references(() => productGroups.id, { onDelete: "cascade" })
      .notNull(),
    variant: text("variant").notNull(),
    value: text("value").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    productGroupIdIdx: index("pv_product_group_id_idx").on(
      table.productGroupId
    ),
  })
);

export type InsertProductVariant = typeof productVariants.$inferInsert;
export type SelectProductVariant = typeof productVariants.$inferSelect;

// Products Table (Actual products with specific variant combinations)
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productGroupId: uuid("product_group_id")
      .references(() => productGroups.id, { onDelete: "cascade" })
      .notNull(),
    sku: text("sku").notNull().unique(), // e.g., "IPHONE-15-128GB-BLACK"
    name: text("name").notNull(), // e.g., "iPhone 15 128GB Black"
    price: integer("price").notNull(), // Harga dalam smallest currency unit (e.g., cents/rupiah)
    stock: integer("stock").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    productGroupIdIdx: index("p_product_group_id_idx").on(table.productGroupId),
    skuIdx: index("p_sku_idx").on(table.sku),
  })
);

export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;

// Product Variant Combinations Table (Links products to their specific variants)
export const productVariantCombinations = pgTable(
  "product_variant_combinations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    variantId: uuid("variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    productIdIdx: index("pvc_product_id_idx").on(table.productId),
    variantIdIdx: index("pvc_variant_id_idx").on(table.variantId),
    productVariantIdx: index("pvc_product_variant_idx").on(
      table.productId,
      table.variantId
    ),
  })
);

export type InsertProductVariantCombination =
  typeof productVariantCombinations.$inferInsert;
export type SelectProductVariantCombination =
  typeof productVariantCombinations.$inferSelect;

// Addresses table
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // Address fields
    addressLabel: text("address_label").notNull(),
    streetAddress: text("street_address").notNull(),
    village: text("village").notNull(),
    district: text("district").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull().default("ID"),

    // Default address flag
    isDefault: boolean("is_default").notNull().default(false),

    // Metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("addr_user_id_idx").on(table.userId),
    defaultIdx: index("addr_default_idx").on(table.userId, table.isDefault),
  })
);

export type InsertAddress = typeof addresses.$inferInsert;
export type SelectAddress = typeof addresses.$inferSelect;

// Carts table
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // Now nullable for guest carts
    sessionId: text("session_id"), // For guest cart identification

    // Metadata
    lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("cart_user_id_idx").on(table.userId),
    sessionIdIdx: index("cart_session_id_idx").on(table.sessionId),
    // Ensure at least one identifier exists
    identifierCheck: check(
      "carts_identifier_check",
      sql`${table.userId} IS NOT NULL OR ${table.sessionId} IS NOT NULL`
    ),
  })
);

export type InsertCart = typeof carts.$inferInsert;
export type SelectCart = typeof carts.$inferSelect;

// Cart Items table
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),

    quantity: integer("quantity").notNull().default(1),
    // Store variant selections as JSON (e.g., {"Color": "Black", "Storage": "128GB"})
    variantSelections: text("variant_selections").notNull().default("{}"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    cartIdIdx: index("ci_cart_id_idx").on(table.cartId),
    productIdIdx: index("ci_product_id_idx").on(table.productId),
    cartProductIdx: index("ci_cart_product_idx").on(
      table.cartId,
      table.productId
    ),
  })
);

export type InsertCartItem = typeof cartItems.$inferInsert;
export type SelectCartItem = typeof cartItems.$inferSelect;

// Orders table
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),

    // User reference
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),

    // Customer snapshot
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    shippingAddress: text("shipping_address").notNull(), // JSON string
    billingAddress: text("billing_address").notNull(), // JSON string

    // Order financials (stored in smallest currency unit, e.g., cents)
    subtotal: integer("subtotal").notNull(),
    tax: integer("tax").notNull().default(0),
    shippingCost: integer("shipping_cost").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),
    currency: text("currency").notNull().default("IDR"),

    // Status tracking (using text fields with TypeScript constants for type safety)
    orderStatus: text("order_status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("pending"),

    // Payment details
    paymentMethod: text("payment_method"), // e.g., "stripe", "paypal"
    paymentIntentId: text("payment_intent_id"), // For payment provider reconciliation

    // Shipping details
    trackingNumber: text("tracking_number"),
    carrier: text("carrier"),

    // Notes
    customerNotes: text("customer_notes"),
    adminNotes: text("admin_notes"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    paidAt: timestamp("paid_at"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    cancelledAt: timestamp("cancelled_at"),

    // Cancellation details
    cancellationReason: text("cancellation_reason"),
  },
  (table) => ({
    orderNumberIdx: index("order_number_idx").on(table.orderNumber),
    userIdIdx: index("order_user_id_idx").on(table.userId),
    orderStatusIdx: index("order_status_idx").on(table.orderStatus),
    paymentStatusIdx: index("order_payment_status_idx").on(table.paymentStatus),
    createdAtIdx: index("order_created_at_idx").on(table.createdAt),
  })
);

export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;

// Order Items table
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),

    // Product reference (nullable if product deleted)
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    // Product snapshot at time of purchase
    productName: text("product_name").notNull(),
    productSku: text("product_sku").notNull(),
    imageUrl: text("image_url"),

    // Pricing snapshot
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(), // Price per unit in smallest currency unit
    subtotal: integer("subtotal").notNull(), // quantity × unitPrice

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("oi_order_id_idx").on(table.orderId),
    productIdIdx: index("oi_product_id_idx").on(table.productId),
  })
);

export type InsertOrderItem = typeof orderItems.$inferInsert;
export type SelectOrderItem = typeof orderItems.$inferSelect;
