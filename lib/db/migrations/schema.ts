import {
  pgTable,
  index,
  foreignKey,
  uuid,
  timestamp,
  text,
  boolean,
  unique,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const productVariantCombinations = pgTable(
  "product_variant_combinations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid("product_id").notNull(),
    variantId: uuid("variant_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("pvc_product_id_idx").using(
      "btree",
      table.productId.asc().nullsLast().op("uuid_ops")
    ),
    index("pvc_product_variant_idx").using(
      "btree",
      table.productId.asc().nullsLast().op("uuid_ops"),
      table.variantId.asc().nullsLast().op("uuid_ops")
    ),
    index("pvc_variant_id_idx").using(
      "btree",
      table.variantId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "product_variant_combinations_product_id_products_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.variantId],
      foreignColumns: [productVariants.id],
      name: "product_variant_combinations_variant_id_product_variants_id_fk",
    }).onDelete("cascade"),
  ]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productGroupId: uuid("product_group_id").notNull(),
    variant: text().notNull(),
    value: text().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("pv_product_group_id_idx").using(
      "btree",
      table.productGroupId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.productGroupId],
      foreignColumns: [productGroups.id],
      name: "product_variants_product_group_id_product_groups_id_fk",
    }).onDelete("cascade"),
  ]
);

export const products = pgTable(
  "products",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productGroupId: uuid("product_group_id").notNull(),
    sku: text().notNull(),
    name: text().notNull(),
    price: integer().notNull(),
    stock: integer().default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("p_product_group_id_idx").using(
      "btree",
      table.productGroupId.asc().nullsLast().op("uuid_ops")
    ),
    index("p_sku_idx").using(
      "btree",
      table.sku.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.productGroupId],
      foreignColumns: [productGroups.id],
      name: "products_product_group_id_product_groups_id_fk",
    }).onDelete("cascade"),
    unique("products_sku_unique").on(table.sku),
  ]
);

export const verifyCodes = pgTable(
  "verify_codes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    verifyType: text("verify_type").notNull(),
    code: text().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    isUsed: boolean("is_used").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "verify_codes_user_id_users_id_fk",
    }),
  ]
);

export const productGroups = pgTable(
  "product_groups",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    category: text().notNull(),
    brand: text().notNull(),
    description: text(),
    isActive: boolean("is_active").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    weight: integer(),
    additionalDescriptions: text("additional_descriptions"),
    images: text(),
    isHighlighted: boolean("is_highlighted").default(false).notNull(),
    slug: text().notNull(),
  },
  (table) => [unique("product_groups_slug_unique").on(table.slug)]
);

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    avatar: text(),
    email: text().notNull(),
    role: text().default("user").notNull(),
    isConfirmed: boolean("is_confirmed").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    phone: text(),
    dateOfBirth: timestamp("date_of_birth", { mode: "string" }),
  },
  (table) => [unique("users_email_unique").on(table.email)]
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    addressLabel: text("address_label").notNull(),
    streetAddress: text("street_address").notNull(),
    city: text().notNull(),
    state: text().notNull(),
    postalCode: text("postal_code").notNull(),
    country: text().default("ID").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    district: text().notNull(),
    village: text().notNull(),
    provinceCode: text("province_code"),
    regencyCode: text("regency_code"),
    districtCode: text("district_code"),
    villageCode: text("village_code"),
  },
  (table) => [
    index("addr_default_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("bool_ops"),
      table.isDefault.asc().nullsLast().op("bool_ops")
    ),
    index("addr_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "addresses_user_id_users_id_fk",
    }).onDelete("cascade"),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    orderId: uuid("order_id").notNull(),
    productId: uuid("product_id"),
    productName: text("product_name").notNull(),
    productSku: text("product_sku").notNull(),
    imageUrl: text("image_url"),
    quantity: integer().notNull(),
    unitPrice: integer("unit_price").notNull(),
    subtotal: integer().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("oi_order_id_idx").using(
      "btree",
      table.orderId.asc().nullsLast().op("uuid_ops")
    ),
    index("oi_product_id_idx").using(
      "btree",
      table.productId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "order_items_order_id_orders_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "order_items_product_id_products_id_fk",
    }).onDelete("set null"),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    cartId: uuid("cart_id").notNull(),
    productId: uuid("product_id").notNull(),
    quantity: integer().default(1).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    variantSelections: text("variant_selections").default("{}").notNull(),
  },
  (table) => [
    index("ci_cart_id_idx").using(
      "btree",
      table.cartId.asc().nullsLast().op("uuid_ops")
    ),
    index("ci_cart_product_idx").using(
      "btree",
      table.cartId.asc().nullsLast().op("uuid_ops"),
      table.productId.asc().nullsLast().op("uuid_ops")
    ),
    index("ci_product_id_idx").using(
      "btree",
      table.productId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.cartId],
      foreignColumns: [carts.id],
      name: "cart_items_cart_id_carts_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "cart_items_product_id_products_id_fk",
    }).onDelete("cascade"),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    orderNumber: text("order_number").notNull(),
    userId: uuid("user_id").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    billingAddress: text("billing_address").notNull(),
    subtotal: integer().notNull(),
    tax: integer().default(0).notNull(),
    shippingCost: integer("shipping_cost").default(0).notNull(),
    discount: integer().default(0).notNull(),
    total: integer().notNull(),
    currency: text().default("IDR").notNull(),
    orderStatus: text("order_status").default("processing").notNull(),
    paymentStatus: text("payment_status").default("unpaid").notNull(),
    paymentMethod: text("payment_method"),
    paymentIntentId: text("payment_intent_id"),
    trackingNumber: text("tracking_number"),
    carrier: text(),
    customerNotes: text("customer_notes"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    paidAt: timestamp("paid_at", { mode: "string" }),
    shippedAt: timestamp("shipped_at", { mode: "string" }),
    deliveredAt: timestamp("delivered_at", { mode: "string" }),
    cancelledAt: timestamp("cancelled_at", { mode: "string" }),
    cancellationReason: text("cancellation_reason"),
  },
  (table) => [
    index("order_created_at_idx").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamp_ops")
    ),
    index("order_number_idx").using(
      "btree",
      table.orderNumber.asc().nullsLast().op("text_ops")
    ),
    index("order_payment_status_idx").using(
      "btree",
      table.paymentStatus.asc().nullsLast().op("text_ops")
    ),
    index("order_status_idx").using(
      "btree",
      table.orderStatus.asc().nullsLast().op("text_ops")
    ),
    index("order_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "orders_user_id_users_id_fk",
    }).onDelete("set null"),
    unique("orders_order_number_unique").on(table.orderNumber),
  ]
);

export const carts = pgTable(
  "carts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    lastActivityAt: timestamp("last_activity_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    sessionId: text("session_id"),
  },
  (table) => [
    index("cart_session_id_idx")
      .using("btree", table.sessionId.asc().nullsLast().op("text_ops"))
      .where(sql`(session_id IS NOT NULL)`),
    index("cart_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "carts_user_id_users_id_fk",
    }).onDelete("cascade"),
    check(
      "carts_identifier_check",
      sql`(user_id IS NOT NULL) OR (session_id IS NOT NULL)`
    ),
  ]
);
