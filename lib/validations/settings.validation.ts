import { z } from "zod";

export const settingsSchema = z.object({
  // Landing page images
  heroImages: z.array(z.string().url()).min(1, "Minimal 1 gambar hero"),

  // Contact info
  contactPhone: z.string().min(1, "Nomor telepon wajib diisi"),
  contactEmail: z.string().email("Email tidak valid"),

  // Social media
  socialTwitter: z
    .string()
    .url("URL Twitter tidak valid")
    .optional()
    .or(z.literal("")),
  socialFacebook: z
    .string()
    .url("URL Facebook tidak valid")
    .optional()
    .or(z.literal("")),
  socialInstagram: z
    .string()
    .url("URL Instagram tidak valid")
    .optional()
    .or(z.literal("")),
  socialTiktok: z
    .string()
    .url("URL TikTok tidak valid")
    .optional()
    .or(z.literal("")),
  socialWhatsapp: z.string().optional().or(z.literal("")),

  // Shipping origin
  shippingOriginAddress: z
    .string()
    .min(1, "Alamat asal pengiriman wajib diisi"),
  shippingOriginCity: z.string().min(1, "Kota asal pengiriman wajib diisi"),
  shippingOriginProvince: z
    .string()
    .min(1, "Provinsi asal pengiriman wajib diisi"),
  shippingOriginPostalCode: z.string().min(1, "Kode pos wajib diisi"),

  // Tax
  taxPercentage: z
    .number()
    .min(0, "Pajak tidak boleh negatif")
    .max(100, "Pajak maksimal 100%"),

  // Order time limit
  pendingOrderTimeLimitHours: z
    .number()
    .int()
    .min(1, "Minimal 1 jam")
    .max(168, "Maksimal 168 jam (7 hari)"),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
