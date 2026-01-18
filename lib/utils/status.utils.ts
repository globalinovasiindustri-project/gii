/**
 * Centralized status translation utilities
 * Maps database status values to Indonesian display text
 */

// Order Status Translations
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
} as const;

// Payment Status Translations
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  failed: "Gagal",
  refunded: "Dikembalikan",
} as const;

/**
 * Format order status to Indonesian
 */
export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}

/**
 * Format payment status to Indonesian
 */
export function formatPaymentStatus(status: string): string {
  return PAYMENT_STATUS_LABELS[status] || status;
}

/**
 * Get badge variant for status display
 */
export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "warning" | "outline" {
  const variantMap: Record<
    string,
    "default" | "secondary" | "destructive" | "warning" | "outline"
  > = {
    // Order status
    pending: "warning",
    processing: "secondary",
    shipped: "secondary",
    delivered: "default",
    cancelled: "destructive",
    // Payment status
    unpaid: "warning",
    paid: "default",
    failed: "destructive",
    refunded: "outline",
  };

  return variantMap[status] || "outline";
}
