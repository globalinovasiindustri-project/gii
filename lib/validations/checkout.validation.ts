import { z } from "zod";

// Contact info validation schema
export const contactInfoSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
});

// Address label options
export const addressLabelOptions = [
  "Rumah",
  "Kantor",
  "Kos",
  "Gudang",
  "Toko",
  "Lainnya",
] as const;

// Address validation schema (base)
export const addressSchema = z.object({
  addressLabel: z.enum(addressLabelOptions, {
    errorMap: () => ({ message: "Pilih jenis alamat" }),
  }),
  streetAddress: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  village: z.string().min(2, "Kelurahan harus diisi"),
  district: z.string().min(2, "Kecamatan harus diisi"),
  city: z.string().min(2, "Kota harus diisi"),
  state: z.string().min(2, "Provinsi harus diisi"),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
});

// Address form schema (with isDefault for create/edit and location codes)
export const addressFormSchema = addressSchema.extend({
  isDefault: z.boolean().optional(),
  // wilayah.id location codes
  provinceCode: z.string().optional(),
  regencyCode: z.string().optional(),
  districtCode: z.string().optional(),
  villageCode: z.string().optional(),
});

// Guest checkout validation schema (combines contact + address)
export const guestCheckoutSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  address: addressSchema,
});

// Guest checkout with shipping selection (extends base schema)
export const guestCheckoutWithShippingSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  addressLabel: z.enum(addressLabelOptions, {
    errorMap: () => ({ message: "Pilih jenis alamat" }),
  }),
  fullAddress: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  village: z.string().min(2, "Kelurahan harus diisi"),
  district: z.string().min(2, "Kecamatan harus diisi"),
  city: z.string().min(2, "Kota harus diisi"),
  province: z.string().min(2, "Provinsi harus diisi"),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
  // wilayah.id location codes
  provinceCode: z.string().optional(),
  regencyCode: z.string().optional(),
  districtCode: z.string().optional(),
  villageCode: z.string().optional(),
  // Shipping selection (optional for backward compatibility)
  selectedCourier: z.string().optional(),
  selectedService: z.string().optional(),
  shippingCost: z.number().nonnegative().optional(),
});

// Authenticated checkout validation schema
export const authenticatedCheckoutSchema = z.object({
  addressId: z.string().min(1, "Silakan pilih alamat pengiriman"),
});

export type ContactInfoSchema = z.infer<typeof contactInfoSchema>;
export type AddressSchema = z.infer<typeof addressSchema>;
export type AddressFormSchema = z.infer<typeof addressFormSchema>;
export type GuestCheckoutSchema = z.infer<typeof guestCheckoutSchema>;
export type GuestCheckoutWithShippingSchema = z.infer<
  typeof guestCheckoutWithShippingSchema
>;
export type AuthenticatedCheckoutSchema = z.infer<
  typeof authenticatedCheckoutSchema
>;
