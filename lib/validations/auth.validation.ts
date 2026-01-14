import z from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, { message: "Nama harus diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
});

// Profile update validation schema (Requirement 4.3, 4.4, 4.5)
export const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama harus diisi" })
    .max(100, { message: "Nama maksimal 100 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }), // Read-only, included for display
  phone: z
    .string()
    .regex(/^(\+62|62|0)?[0-9]{9,13}$/, {
      message: "Format nomor telepon tidak valid (contoh: 08123456789)",
    })
    .or(z.literal(""))
    .optional()
    .transform((val) => val || null),
  dateOfBirth: z.date().optional().nullable(),
});

// Email change request schema
export const emailChangeRequestSchema = z.object({
  newEmail: z.string().email({ message: "Email tidak valid" }),
});

export type RegisterFormInput = z.infer<typeof registerSchema>;
export type LoginFormInput = z.infer<typeof loginSchema>;
export type ProfileFormSchema = z.infer<typeof profileFormSchema>;
export type EmailChangeRequestSchema = z.infer<typeof emailChangeRequestSchema>;
