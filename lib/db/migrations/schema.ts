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
  serial,
  bigint,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const role = pgEnum("role", ["user", "admin", "super_admin"]);
export const variant = pgEnum("variant", [
  "color",
  "screen",
  "storage",
  "type",
]);
export const verifyType = pgEnum("verify_type", ["register", "reset_password"]);

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

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    avatar: text(),
    email: text().notNull(),
    role: role().default("user").notNull(),
    isConfirmed: boolean("is_confirmed").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("users_email_unique").on(table.email)]
);

export const productGroups = pgTable("product_groups", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  category: text().notNull(),
  brand: text().notNull(),
  description: text(),
  isActive: boolean("is_active").default(true).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  weight: integer(),
  additionalDescriptions: text("additional_descriptions"),
});

export const addresses = pgTable(
  "addresses",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    recipientName: text("recipient_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    streetAddress: text("street_address").notNull(),
    addressLine2: text("address_line_2"),
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

export const carts = pgTable(
  "carts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    lastActivityAt: timestamp("last_activity_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("cart_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "carts_user_id_users_id_fk",
    }).onDelete("cascade"),
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
    paymentStatus: text("payment_status").default("pending").notNull(),
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

export const drizzleMigrations = pgTable("__drizzle_migrations", {
  id: serial().primaryKey().notNull(),
  hash: text().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  createdAt: bigint("created_at", { mode: "number" }),
});
