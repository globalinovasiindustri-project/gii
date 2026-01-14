import { db } from "../db/db";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import {
  orders,
  orderItems,
  products,
  users,
  carts,
  cartItems,
  addresses,
  type SelectOrder,
  type SelectOrderItem,
  type SelectProduct,
} from "../db/schema";
import { UserRole } from "../enums";
import {
  generateOrderNumber,
  generateSecurePassword,
} from "../utils/order.utils";
import type { CartItem } from "../types/cart.types";
import { ValidationError, NotFoundError } from "../errors";
import type { UpdateOrderStatusSchema } from "../validations/order.validation";
import { addressService } from "./address.service";

type WhereCondition = SQL<unknown> | undefined;

// === Service Layer Types ===

export interface OrderFilters {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  page: number;
  pageSize: number;
}

export interface CompleteOrder {
  order: SelectOrder;
  orderItems: Array<{
    orderItem: SelectOrderItem;
    product: SelectProduct | null;
  }>;
}

export interface CreateOrderInput {
  // Contact info
  customerEmail: string;
  customerName: string;
  customerPhone: string;

  // Shipping address
  addressLabel: string;
  fullAddress: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;

  // wilayah.id location codes for address persistence
  provinceCode?: string;
  regencyCode?: string;
  districtCode?: string;
  villageCode?: string;

  // Shipping selection
  selectedCourier?: string;
  selectedService?: string;
  shippingCost?: number;

  // Cart items (passed from cart service)
  cartItems: CartItem[];

  // Session ID for guest user
  sessionId: string;

  // Optional notes
  notes?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  userId: string; // Newly created user ID
}

export interface CreateAuthenticatedOrderInput {
  userId: string;
  addressId: string;
  cartItems: CartItem[];
  // Shipping selection
  selectedCourier?: string;
  selectedService?: string;
  shippingCost?: number;
}

export interface CreateAuthenticatedOrderResult {
  orderId: string;
  orderNumber: string;
}

// === Query Filter Builders ===

function createOrderFilters(filters: OrderFilters): WhereCondition[] {
  const conditions: WhereCondition[] = [];

  // Search filter - search by order number or customer name
  if (filters.search && filters.search.trim() !== "") {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        ilike(orders.orderNumber, searchTerm),
        ilike(orders.customerName, searchTerm)
      )
    );
  }

  // Order status filter
  if (filters.orderStatus && filters.orderStatus !== "all") {
    conditions.push(eq(orders.orderStatus, filters.orderStatus));
  }

  // Payment status filter
  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  }

  return conditions;
}

// === Database Queries ===

async function fetchOrdersWithItems(
  conditions: WhereCondition[],
  limit: number,
  offset: number
) {
  const validConditions = conditions.filter(
    (c): c is SQL<unknown> => c !== undefined
  );

  const whereClause =
    validConditions.length > 0 ? and(...validConditions) : undefined;

  // Query orders with order items and products in a single query
  const results = await db
    .select({
      order: orders,
      orderItem: orderItems,
      product: products,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

async function fetchSingleOrderWithItems(orderId: string) {
  const results = await db
    .select({
      order: orders,
      orderItem: orderItems,
      product: products,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orders.id, orderId));

  return results;
}

// === Data Assembly ===

function groupOrdersByOrderId(
  queryResults: Array<{
    order: SelectOrder;
    orderItem: SelectOrderItem | null;
    product: SelectProduct | null;
  }>
): CompleteOrder[] {
  const ordersMap = new Map<string, CompleteOrder>();

  for (const row of queryResults) {
    const orderId = row.order.id;

    // Initialize order if not exists
    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        order: row.order,
        orderItems: [],
      });
    }

    // Add order item if exists
    if (row.orderItem) {
      const completeOrder = ordersMap.get(orderId)!;
      completeOrder.orderItems.push({
        orderItem: row.orderItem,
        product: row.product,
      });
    }
  }

  return Array.from(ordersMap.values());
}

// === Main Service ===

export const orderService = {
  /**
   * Get filtered list of orders with pagination
   */
  async getOrders(
    filters: OrderFilters,
    viewerRole: UserRole
  ): Promise<CompleteOrder[]> {
    // Build filter conditions
    const filterConditions = createOrderFilters(filters);

    // Calculate pagination
    const limit = filters.pageSize;
    const offset = (filters.page - 1) * filters.pageSize;

    // Fetch orders with items
    const queryResults = await fetchOrdersWithItems(
      filterConditions,
      limit,
      offset
    );

    // Group order items by order
    const completeOrders = groupOrdersByOrderId(queryResults);

    return completeOrders;
  },

  /**
   * Get single order by ID with all related data
   */
  async getOrderById(
    orderId: string,
    viewerRole: UserRole
  ): Promise<CompleteOrder | null> {
    // Fetch order with items
    const queryResults = await fetchSingleOrderWithItems(orderId);

    if (queryResults.length === 0) {
      return null;
    }

    // Group order items by order
    const completeOrders = groupOrdersByOrderId(queryResults);

    return completeOrders[0] || null;
  },

  /**
   * Get orders for a specific user
   * Returns all orders for the authenticated user with order items and product details
   * Sorted by creation date (newest first)
   */
  async getUserOrders(userId: string): Promise<CompleteOrder[]> {
    // Fetch orders with items for the specific user
    const queryResults = await db
      .select({
        order: orders,
        orderItem: orderItems,
        product: products,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    // Group order items by order
    const completeOrders = groupOrdersByOrderId(queryResults);

    return completeOrders;
  },

  /**
   * Create order for guest checkout with auto-registration
   * This method handles the complete guest checkout flow:
   * 1. Checks for duplicate email
   * 2. Creates user account with generated password
   * 3. Saves shipping address to user's address list (non-blocking)
   * 4. Creates order with auto-paid status
   * 5. Creates order items from cart
   * 6. Clears cart after successful order
   */
  async createGuestOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    // Execute order creation in transaction
    const orderResult = await db.transaction(async (tx) => {
      // 1. Check if email already exists before creating order
      const existingUser = await tx
        .select()
        .from(users)
        .where(eq(users.email, input.customerEmail))
        .limit(1);

      if (existingUser.length > 0) {
        throw new ValidationError("Email sudah terdaftar");
      }

      // 2. Create user account first (required for order.userId)
      const randomPassword = generateSecurePassword();
      const [newUser] = await tx
        .insert(users)
        .values({
          email: input.customerEmail,
          name: input.customerName,
          isConfirmed: true, // Auto-confirmed for guest checkout
          isActive: true,
          role: "user",
        })
        .returning();

      // 3. Generate order number
      const orderNumber = generateOrderNumber();

      // 4. Calculate totals
      const subtotal = input.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      // Use provided shipping cost or default to 15000
      const shippingCost = input.shippingCost ?? 15000;
      const total = subtotal + shippingCost;

      // 5. Create order record with the newly created userId
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: newUser.id,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          shippingAddress: JSON.stringify({
            addressLabel: input.addressLabel,
            phone: input.customerPhone,
            fullAddress: input.fullAddress,
            village: input.village,
            district: input.district,
            city: input.city,
            province: input.province,
            postalCode: input.postalCode,
            // Include location codes in shipping address JSON for reference
            provinceCode: input.provinceCode,
            regencyCode: input.regencyCode,
            districtCode: input.districtCode,
            villageCode: input.villageCode,
          }),
          billingAddress: JSON.stringify({
            addressLabel: input.addressLabel,
            phone: input.customerPhone,
            fullAddress: input.fullAddress,
            village: input.village,
            district: input.district,
            city: input.city,
            province: input.province,
            postalCode: input.postalCode,
          }),
          subtotal,
          shippingCost,
          total,
          orderStatus: "pending",
          paymentStatus: "paid", // Auto-paid for MVP
          currency: "IDR",
          customerNotes: input.notes,
          // Store shipping selection details
          carrier: input.selectedCourier
            ? `${input.selectedCourier}${input.selectedService ? ` - ${input.selectedService}` : ""}`
            : null,
        })
        .returning();

      // 6. Create order items from cart items
      const orderItemsData = input.cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        productSku: item.sku,
        imageUrl: item.thumbnailUrl,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
      }));

      await tx.insert(orderItems).values(orderItemsData);

      // 7. Clear cart after successful order
      const [cart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.sessionId, input.sessionId))
        .limit(1);

      if (cart) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      }

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: newUser.id,
      };
    });

    // 8. Save address to user's address list (non-blocking)
    // Done outside transaction to ensure order succeeds even if address save fails
    try {
      await addressService.createAddressFromCheckout({
        userId: orderResult.userId,
        addressLabel: input.addressLabel,
        streetAddress: input.fullAddress,
        village: input.village,
        district: input.district,
        city: input.city,
        state: input.province,
        postalCode: input.postalCode,
        provinceCode: input.provinceCode,
        regencyCode: input.regencyCode,
        districtCode: input.districtCode,
        villageCode: input.villageCode,
      });
    } catch (error) {
      // Log error but don't fail the order
      console.error("Failed to save guest checkout address:", error);
    }

    return orderResult;
  },

  /**
   * Create order for authenticated checkout
   * This method handles the complete authenticated checkout flow:
   * 1. Fetches user data by userId
   * 2. Fetches and validates address ownership
   * 3. Creates order with address snapshot
   * 4. Creates order items from cart
   * 5. Clears user cart after successful order
   */
  async createAuthenticatedOrder(
    input: CreateAuthenticatedOrderInput
  ): Promise<CreateAuthenticatedOrderResult> {
    return await db.transaction(async (tx) => {
      // 1. Get user details
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) {
        throw new ValidationError("User not found");
      }

      // 2. Get address details with ownership validation
      const [address] = await tx
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.id, input.addressId),
            eq(addresses.userId, input.userId)
          )
        )
        .limit(1);

      if (!address) {
        throw new ValidationError("Alamat tidak valid atau tidak ditemukan");
      }

      // 3. Generate order number
      const orderNumber = generateOrderNumber();

      // 4. Calculate totals
      const subtotal = input.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      // Use provided shipping cost or default to 15000
      const shippingCost = input.shippingCost ?? 15000;
      const total = subtotal + shippingCost;

      // 5. Prepare address JSON snapshot
      const shippingAddress = {
        addressLabel: address.addressLabel,
        phone: user.email, // Use email as fallback since phone removed from address
        fullAddress: address.streetAddress,
        village: address.village,
        district: address.district,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        // Include location codes for reference
        provinceCode: address.provinceCode,
        regencyCode: address.regencyCode,
        districtCode: address.districtCode,
        villageCode: address.villageCode,
      };

      // 6. Create order record
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: input.userId,
          customerEmail: user.email,
          customerName: user.name,
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(shippingAddress), // Same as shipping
          subtotal,
          shippingCost,
          total,
          orderStatus: "pending",
          paymentStatus: "paid", // Auto-paid for MVP
          currency: "IDR",
          // Store shipping selection details
          carrier: input.selectedCourier
            ? `${input.selectedCourier}${input.selectedService ? ` - ${input.selectedService}` : ""}`
            : null,
        })
        .returning();

      // 7. Create order items from cart items
      const orderItemsData = input.cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        productSku: item.sku,
        imageUrl: item.thumbnailUrl,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
      }));

      await tx.insert(orderItems).values(orderItemsData);

      // 8. Clear user cart after successful order
      const [cart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.userId, input.userId))
        .limit(1);

      if (cart) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      }

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
      };
    });
  },

  /**
   * Update order status with timestamp management
   * Handles status transitions and clears/sets timestamps appropriately:
   * - pending: clears all progression timestamps (shippedAt, deliveredAt, cancelledAt)
   * - shipped: sets shippedAt, clears deliveredAt and cancelledAt
   * - delivered: sets deliveredAt, clears cancelledAt
   * - cancelled: sets cancelledAt
   */
  async updateStatus(
    orderId: string,
    data: UpdateOrderStatusSchema
  ): Promise<CompleteOrder> {
    // Verify order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existingOrder) {
      throw new NotFoundError("Order tidak ditemukan");
    }

    const now = new Date();

    // Build update object based on new status
    type OrderUpdate = {
      orderStatus: string;
      updatedAt: Date;
      shippedAt?: Date | null;
      deliveredAt?: Date | null;
      cancelledAt?: Date | null;
      cancellationReason?: string | null;
      trackingNumber?: string | null;
      carrier?: string | null;
    };

    const updateData: OrderUpdate = {
      orderStatus: data.orderStatus,
      updatedAt: now,
    };

    // Handle timestamp logic based on status transition
    switch (data.orderStatus) {
      case "pending":
        // Clear all progression timestamps when rolling back to pending
        updateData.shippedAt = null;
        updateData.deliveredAt = null;
        updateData.cancelledAt = null;
        updateData.cancellationReason = null;
        break;

      case "shipped":
        // Set shippedAt, clear deliveredAt and cancelledAt
        updateData.shippedAt = now;
        updateData.deliveredAt = null;
        updateData.cancelledAt = null;
        updateData.cancellationReason = null;
        // Store optional tracking info
        if (data.trackingNumber !== undefined) {
          updateData.trackingNumber = data.trackingNumber || null;
        }
        if (data.carrier !== undefined) {
          updateData.carrier = data.carrier || null;
        }
        break;

      case "delivered":
        // Set deliveredAt, clear cancelledAt
        updateData.deliveredAt = now;
        updateData.cancelledAt = null;
        updateData.cancellationReason = null;
        break;

      case "cancelled":
        // Set cancelledAt and optional reason
        updateData.cancelledAt = now;
        if (data.cancellationReason !== undefined) {
          updateData.cancellationReason = data.cancellationReason || null;
        }
        break;
    }

    // Execute update
    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    // Fetch complete order with items to return consistent data structure
    const completeOrder = await this.getOrderById(orderId, "admin");
    if (!completeOrder) {
      throw new NotFoundError("Order tidak ditemukan setelah update");
    }

    return completeOrder;
  },

  /**
   * Get all orders for CSV export (no pagination)
   * Returns flattened order data suitable for CSV generation
   */
  async getOrdersForExport(filters: Omit<OrderFilters, "page" | "pageSize">) {
    const filterConditions = createOrderFilters({
      ...filters,
      page: 1,
      pageSize: 10000, // Large limit for export
    });

    const validConditions = filterConditions.filter(
      (c): c is SQL<unknown> => c !== undefined
    );

    const whereClause =
      validConditions.length > 0 ? and(...validConditions) : undefined;

    // Query orders with order items for export
    const results = await db
      .select({
        // Order fields
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        shippingAddress: orders.shippingAddress,
        subtotal: orders.subtotal,
        shippingCost: orders.shippingCost,
        total: orders.total,
        orderStatus: orders.orderStatus,
        paymentStatus: orders.paymentStatus,
        carrier: orders.carrier,
        trackingNumber: orders.trackingNumber,
        customerNotes: orders.customerNotes,
        adminNotes: orders.adminNotes,
        createdAt: orders.createdAt,
        // Order item fields
        productName: orderItems.productName,
        productSku: orderItems.productSku,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        itemSubtotal: orderItems.subtotal,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt));

    return results;
  },

  /**
   * Update admin notes for an order
   */
  async updateAdminNotes(
    orderId: string,
    adminNotes: string
  ): Promise<CompleteOrder> {
    // Verify order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existingOrder) {
      throw new NotFoundError("Order tidak ditemukan");
    }

    await db
      .update(orders)
      .set({
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Fetch complete order with items to return consistent data structure
    const completeOrder = await this.getOrderById(orderId, "admin");
    if (!completeOrder) {
      throw new NotFoundError("Order tidak ditemukan setelah update");
    }

    return completeOrder;
  },
};
