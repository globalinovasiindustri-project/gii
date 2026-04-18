import {
  Palette,
  HardDrive,
  Ruler,
  Tag,
  Smartphone,
  Tv,
  Watch,
  Home,
  Laptop,
} from "lucide-react";

export const USER_ROLES = ["user", "admin", "super_admin", undefined] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const VARIANT_TYPES = {
  COLOR: { value: "color", label: "Warna", icon: Palette },
  STORAGE: { value: "storage", label: "Penyimpanan", icon: HardDrive },
  SIZE: { value: "size", label: "Ukuran", icon: Ruler },
  TYPE: { value: "type", label: "Tipe", icon: Tag },
} as const;

export type VariantType =
  (typeof VARIANT_TYPES)[keyof typeof VARIANT_TYPES]["value"];

export const PRODUCT_CATEGORIES = {
  SMARTPHONES: { value: "smartphones", label: "Smartphones", icon: Smartphone },
  TELEVISIONS: { value: "televisions", label: "Televisions", icon: Tv },
  SMART_WATCHES: {
    value: "smart-watches",
    label: "Smart Watches",
    icon: Watch,
  },
  HOME_APPLIANCES: {
    value: "home-appliances",
    label: "Home Appliances",
    icon: Home,
  },
  COMPUTER_LAPTOPS: {
    value: "computer-laptops",
    label: "Computer & Laptops",
    icon: Laptop,
  },
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES]["value"];

export const PRODUCT_BRANDS = {
  APPLE: { value: "apple", label: "Apple" },
  SAMSUNG: { value: "samsung", label: "Samsung" },
  XIAOMI: { value: "xiaomi", label: "Xiaomi" },

  SONY: { value: "sony", label: "Sony" },
  LG: { value: "lg", label: "LG" },
  ASUS: { value: "asus", label: "ASUS" },
} as const;

export type ProductBrand =
  (typeof PRODUCT_BRANDS)[keyof typeof PRODUCT_BRANDS]["value"];

export const ACTIVE_STATUS_FILTER = {
  ALL: { value: "all", label: "Semua Status" },
  ACTIVE: { value: "active", label: "Aktif" },
  INACTIVE: { value: "inactive", label: "Tidak Aktif" },
} as const;

export type ActiveStatusFilter =
  (typeof ACTIVE_STATUS_FILTER)[keyof typeof ACTIVE_STATUS_FILTER]["value"];
