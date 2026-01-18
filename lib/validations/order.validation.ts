import { z } from "zod";

// Order status values aligned with database schema
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

const ORDER_STATUS_VALUES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
] as const;

// Schema for updating order status
export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(ORDER_STATUS_VALUES, {
    required_error: "Status order harus dipilih",
    invalid_type_error: "Status order tidak valid",
  }),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
