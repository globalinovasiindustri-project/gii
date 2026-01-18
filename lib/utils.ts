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
// Handles both order snapshots (fullAddress, province) and address records (streetAddress, state)
export function formatAddress(address: any): string {
  if (!address || typeof address !== "object") {
    return "N/A";
  }

  // Support both field naming conventions:
  // - Order snapshots use: fullAddress, province
  // - Address records use: streetAddress, state
  const streetAddress = address.fullAddress || address.streetAddress;
  const province = address.province || address.state;

  const parts = [
    streetAddress,
    address.village,
    address.district,
    address.city,
    province,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
}

// DateTime formatting utility
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return dayjs(date).format("MMM D, YYYY h:mm A");
}

// Status formatting utility - delegates to centralized status utils
export { formatOrderStatus, formatPaymentStatus } from "./utils/status.utils";

// Legacy formatStatus for backward compatibility - converts to title case
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Status variant mapping utility - delegates to centralized status utils
export { getStatusVariant } from "./utils/status.utils";
