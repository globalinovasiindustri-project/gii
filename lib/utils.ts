import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Enable dayjs plugins
dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting utility
export function formatCurrency(
  amount: number,
  currency: string = "IDR"
): string {
  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount / 100); // Assuming cents for non-IDR currencies
}

// Address formatting utility
export function formatAddress(address: any): string {
  if (!address || typeof address !== "object") {
    return "N/A";
  }

  const parts = [
    address.streetAddress,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
}

// DateTime formatting utility
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return dayjs(date).format("MMM D, YYYY h:mm A");
}

// Status formatting utility
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Status variant mapping utility
export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "warning" | "outline" {
  const statusMap: Record<
    string,
    "default" | "secondary" | "destructive" | "warning" | "outline"
  > = {
    // Order status
    pending: "warning",
    shipped: "secondary",
    delivered: "default",
    cancelled: "destructive",
    // Payment status
    paid: "default",
    failed: "destructive",
    refunded: "outline",
  };

  return statusMap[status] || "outline";
}
