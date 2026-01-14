import { db } from "@/lib/db/db";
import { users, SelectUser, InsertUser } from "@/lib/db/schema";
import { eq, and, or, ilike, desc, count } from "drizzle-orm";
import { emailService } from "./email.service";

export interface GetUsersParams {
  page?: number;
  search?: string;
  role?: "user" | "admin" | "super_admin";
  isActive?: boolean;
}

export interface GetUsersResponse {
  users: SelectUser[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const userService = {
  // Get users with pagination and filters
  getUsers: async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    const { page = 1, search, role, isActive } = params;
    const limit = 10; // Fixed limit as requested
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(users.isDeleted, false)]; // Always exclude deleted users

    if (search) {
      conditions.push(
        or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))!
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (isActive !== undefined) {
      conditions.push(eq(users.isActive, isActive));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    // Get users with pagination
    const usersResult = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    return {
      users: usersResult,
      total,
      totalPages,
      currentPage: page,
    };
  },

  // Get user by ID
  getUserById: async (id: string): Promise<SelectUser | null> => {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .limit(1);

    return result[0] || null;
  },

  // Update user
  updateUser: async (
    id: string,
    data: Partial<Pick<SelectUser, "name" | "email" | "role" | "isActive">>
  ): Promise<SelectUser | null> => {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .returning();

    return result[0] || null;
  },

  // Update user profile (name, phone, and dateOfBirth)
  updateProfile: async (
    id: string,
    data: { name?: string; phone?: string | null; dateOfBirth?: Date | null }
  ): Promise<SelectUser | null> => {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .returning();

    return result[0] || null;
  },

  // Update user avatar
  updateAvatar: async (
    id: string,
    avatarUrl: string
  ): Promise<SelectUser | null> => {
    const result = await db
      .update(users)
      .set({
        avatar: avatarUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .returning();

    return result[0] || null;
  },

  // Soft delete user
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      const [result] = await db
        .update(users)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      return !!result;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  },

  // Create new user
  createUser: async (
    userData: Pick<InsertUser, "name" | "email" | "role">
  ): Promise<{ success: boolean; user?: SelectUser; message: string }> => {
    try {
      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(and(eq(users.email, userData.email), eq(users.isDeleted, false)))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: "Email sudah digunakan oleh pengguna lain",
        };
      }

      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          name: userData.name,
          email: userData.email,
          role: userData.role || "user",
          isConfirmed: false, // User needs to confirm email
          isActive: true,
          isDeleted: false,
        })
        .returning();

      // Send notification email to the new user
      const emailResult = await emailService.sendNewUserNotification({
        to: newUser.email,
        name: newUser.name,
        email: newUser.email,
        createdBy: "Administrator",
        loginLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?email=${encodeURIComponent(newUser.email)}`,
      });

      if (!emailResult.success) {
        console.warn("Failed to send notification email:", emailResult.message);
        // Don't fail the user creation if email fails
      }

      return {
        success: true,
        user: newUser,
        message: "Pengguna berhasil dibuat dan email notifikasi telah dikirim",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat membuat pengguna",
      };
    }
  },
};
