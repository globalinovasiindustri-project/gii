import z from "zod";
import { VARIANT_TYPES, PRODUCT_CATEGORIES, PRODUCT_BRANDS } from "@/lib/enums";

// ====== Enum helpers (selaras dengan UI Select & Checkbox) ======
const VARIANT_TYPE_VALUES = [
  VARIANT_TYPES.COLOR.value,
  VARIANT_TYPES.STORAGE.value,
  VARIANT_TYPES.SIZE.value,
  VARIANT_TYPES.TYPE.value,
] as const;

const CATEGORY_VALUES = [
  PRODUCT_CATEGORIES.SMARTPHONES.value,
  PRODUCT_CATEGORIES.TELEVISIONS.value,
  PRODUCT_CATEGORIES.SMART_WATCHES.value,
  PRODUCT_CATEGORIES.HOME_APPLIANCES.value,
  PRODUCT_CATEGORIES.COMPUTER_LAPTOPS.value,
] as const;

const BRAND_VALUES = [
  PRODUCT_BRANDS.APPLE.value,
  PRODUCT_BRANDS.SAMSUNG.value,
  PRODUCT_BRANDS.XIAOMI.value,
] as const;

// ====== Variant option (per nilai varian yang tersedia di grup) ======
export const variantSchema = z.object({
  id: z.string().optional(),
  type: z.enum(VARIANT_TYPE_VALUES, {
    required_error: "Tipe varian harus diisi",
  }),
  value: z.string().min(1, { message: "Nilai varian harus diisi" }),
  active: z.boolean(),
});

export type VariantSchema = z.infer<typeof variantSchema>;

// ====== Kombinasi produk (produk aktual) ======
// UI menyimpan varian sebagai object { [variantType]: value }
// Validasi value dilakukan di superRefine berdasarkan hasVariants
const combinationVariantsSchema = z
  .record(z.string(), z.string())
  .refine(
    (obj) =>
      Object.keys(obj).every((k) =>
        (VARIANT_TYPE_VALUES as readonly string[]).includes(k)
      ),
    { message: "Tipe varian tidak valid pada kombinasi" }
  );

export const variantCombinationSchema = z.object({
  id: z.string().optional(),
  variants: combinationVariantsSchema.default({}),
  sku: z.string().min(1, { message: "SKU harus diisi" }),
  name: z.string().optional(), // Nama kombinasi tidak ada di UI, boleh dikosongkan/di-derive
  price: z.coerce
    .number()
    .int({ message: "Harga harus berupa angka bulat" })
    .min(0, { message: "Harga harus lebih besar atau sama dengan 0" }),
  stock: z.coerce
    .number()
    .int({ message: "Stok harus berupa angka bulat" })
    .min(0, { message: "Stok harus lebih besar atau sama dengan 0" }),
  active: z.boolean(),
});

export type VariantCombinationSchema = z.infer<typeof variantCombinationSchema>;

// ====== Additional Description Item ======
export const additionalDescriptionItemSchema = z.object({
  title: z.string().max(100, { message: "Title maksimal 100 karakter" }),
  body: z.string().max(1000, { message: "Body maksimal 1000 karakter" }),
});

export type AdditionalDescriptionItem = z.infer<
  typeof additionalDescriptionItemSchema
>;

// ====== Skema Form Produk (grup + pilihan varian + kombinasi) ======
export const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Nama harus diisi" }),
    slug: z.string().optional(), // Auto-generated from name, not user input
    category: z.enum(CATEGORY_VALUES, {
      required_error: "Kategori harus dipilih",
    }),
    brand: z.enum(BRAND_VALUES, { required_error: "Merk harus dipilih" }),
    // Berat di UI ada di level grup, opsional; dikonversi ke number
    weight: z.coerce
      .number()
      .int({ message: "Berat harus berupa angka bulat" })
      .min(0, { message: "Berat harus lebih besar atau sama dengan 0" })
      .optional(),
    description: z.string().max(500).optional(),
    isActive: z.boolean(),
    hasVariants: z.boolean(),

    // Featured product flag
    isHighlighted: z.boolean().default(false),

    // Product images with thumbnail designation
    images: z
      .array(
        z.object({
          url: z.string().url({ message: "URL gambar tidak valid" }),
          isThumbnail: z.boolean(),
        })
      )
      .optional()
      .refine(
        (images) => {
          // If images exist, at least one must be marked as thumbnail
          if (images && images.length > 0) {
            return images.some((img) => img.isThumbnail);
          }
          return true;
        },
        { message: "Setidaknya satu gambar harus ditandai sebagai thumbnail" }
      ),

    // Selaras dengan checkbox di UI (selectedVariants)
    variantTypes: z.array(z.enum(VARIANT_TYPE_VALUES)).default([]),

    // Selaras dengan daftar kombinasi di UI
    combinations: z
      .array(variantCombinationSchema)
      .min(1, { message: "Minimal satu kombinasi produk" }),

    // Additional descriptions (optional)
    additionalDescriptions: z
      .array(additionalDescriptionItemSchema)
      .optional()
      .default([])
      .transform((items) =>
        // Filter out items where both title and body are empty strings
        items.filter(
          (item) => item.title.trim() !== "" && item.body.trim() !== ""
        )
      ),
  })
  .superRefine((data, ctx) => {
    // Jika memakai varian, wajib pilih setidaknya satu tipe
    if (data.hasVariants) {
      if (data.variantTypes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variantTypes"],
          message: "Pilih minimal satu tipe varian",
        });
      }

      // Setiap kombinasi harus mengandung semua tipe varian yang dipilih dengan nilai non-empty
      data.combinations.forEach((combination, idx) => {
        const variants = combination.variants;
        const required = data.variantTypes;

        required.forEach((variantType) => {
          const value = variants[variantType];
          if (!value || value.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["combinations", idx, "variants"],
              message: `Nilai varian "${variantType}" harus diisi pada kombinasi`,
            });
          }
        });
      });
    }
    // Jika tidak memakai varian, variants boleh kosong atau diabaikan
    // Tidak perlu validasi karena akan di-clear saat submit
  });

export type ProductSchema = z.infer<typeof productSchema>;
