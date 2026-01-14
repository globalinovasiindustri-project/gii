import { relations } from "drizzle-orm/relations";
import { products, productVariantCombinations, productVariants, productGroups, users, verifyCodes, addresses, orders, orderItems, carts, cartItems } from "./schema";

export const productVariantCombinationsRelations = relations(productVariantCombinations, ({one}) => ({
	product: one(products, {
		fields: [productVariantCombinations.productId],
		references: [products.id]
	}),
	productVariant: one(productVariants, {
		fields: [productVariantCombinations.variantId],
		references: [productVariants.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productVariantCombinations: many(productVariantCombinations),
	productGroup: one(productGroups, {
		fields: [products.productGroupId],
		references: [productGroups.id]
	}),
	orderItems: many(orderItems),
	cartItems: many(cartItems),
}));

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	productVariantCombinations: many(productVariantCombinations),
	productGroup: one(productGroups, {
		fields: [productVariants.productGroupId],
		references: [productGroups.id]
	}),
}));

export const productGroupsRelations = relations(productGroups, ({many}) => ({
	productVariants: many(productVariants),
	products: many(products),
}));

export const verifyCodesRelations = relations(verifyCodes, ({one}) => ({
	user: one(users, {
		fields: [verifyCodes.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	verifyCodes: many(verifyCodes),
	addresses: many(addresses),
	orders: many(orders),
	carts: many(carts),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
}));

export const cartsRelations = relations(carts, ({one, many}) => ({
	cartItems: many(cartItems),
	user: one(users, {
		fields: [carts.userId],
		references: [users.id]
	}),
}));