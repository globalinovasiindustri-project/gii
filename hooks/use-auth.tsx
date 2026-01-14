"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RegisterFormInput,
  LoginFormInput,
  ProfileFormSchema,
} from "@/lib/validations/auth.validation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { InferSelectModel } from "drizzle-orm";
import type { users } from "@/lib/db/schema";

interface LoginResponse {
  success: boolean;
  message: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      role: string;
      isVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  } | null;
}

interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: InferSelectModel<typeof users> | null;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: InferSelectModel<typeof users> | null;
}

// The /api/auth/me route returns a raw user object (SelectUser)

const authApi = {
  login: async (data: LoginFormInput): Promise<LoginResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Terjadi kesalahan saat login");
    }

    return response.json();
  },

  logout: async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Terjadi kesalahan saat logout");
    }

    return response.json();
  },

  register: async (data: RegisterFormInput): Promise<RegisterResponse> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Terjadi kesalahan saat mendaftar");
    }

    return response.json();
  },

  verify: async (type: string, code: string): Promise<VerifyResponse> => {
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, code }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Terjadi kesalahan saat memverifikasi"
      );
    }

    return response.json();
  },

  me: async (): Promise<CurrentUserResponse> => {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Terjadi kesalahan saat mengambil data pengguna"
      );
    }

    return response.json();
  },

  updateProfile: async (
    data: ProfileFormSchema
  ): Promise<UpdateProfileResponse> => {
    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Terjadi kesalahan saat memperbarui profil"
      );
    }

    return response.json();
  },

  uploadAvatar: async (file: File): Promise<UpdateProfileResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch("/api/auth/avatar", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Terjadi kesalahan saat mengunggah foto"
      );
    }

    return response.json();
  },
};

export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: (data: LoginFormInput) => authApi.login(data),
    onSuccess: (data) =>
      // Show success toast
      toast.success(data.message),
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
  };
};

export const useLogout = () => {
  // Define router
  const router = useRouter();
  // Logout mutation
  const mutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data) => {
      // Show success toast
      toast.success(data.message);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
  };
};

export const useRegister = () => {
  // State
  const [emailSent, setEmailSent] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");

  // Register mutation
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data, variables) => {
      // Show success toast
      toast.success(data.message);
      // Set email sent state
      setEmailSent(true);
      setEnteredEmail(variables.email);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
    emailSent,
    enteredEmail,
  };
};

export const useVerify = (type: string, code: string) => {
  // Define router
  const router = useRouter();
  // Verify mutation
  const mutation = useMutation({
    mutationFn: () => authApi.verify(type, code),
    onSuccess: (data) => {
      // Show success toast
      toast.success(data.message);
      // Redirect to login page
      router.push("/");
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });

  return {
    ...mutation,
  };
};

export const useMe = () => {
  const mutation = useQuery<CurrentUserResponse>({
    queryKey: ["me"],
    queryFn: authApi.me,
  });

  return {
    ...mutation,
  };
};

// Hook for updating user profile (Requirement 4.3, 4.4, 4.6, 4.7)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileFormSchema) => authApi.updateProfile(data),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // Show success toast (Requirement 4.6)
      toast.success(data.message);
    },
    onError: (error) => {
      // Show error toast (Requirement 4.7)
      toast.error(error.message);
    },
  });
};

// Hook for uploading avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // Show success toast
      toast.success(data.message || "Foto profil berhasil diperbarui");
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message);
    },
  });
};

export const useAuth = () => {
  const {
    mutate: login,
    isPending: isLoginLoading,
    isError: isLoginError,
  } = useLogin();
  const {
    mutate: logout,
    isPending: isLogoutLoading,
    isError: isLogoutError,
  } = useLogout();
  const {
    mutate: register,
    isPending: isRegisterLoading,
    isError: isRegisterError,
  } = useRegister();
  const {
    mutate: verify,
    isPending: isVerifyLoading,
    isError: isVerifyError,
  } = useVerify("email", "");
  const { data: me, isPending: isMeLoading, isError: isMeError } = useMe();
  const isLoggedIn = !!me?.data?.id;

  return {
    login,
    logout,
    register,
    verify,
    me,
    isLoggedIn,
    isLoginLoading,
    isLoginError,
    isLogoutLoading,
    isLogoutError,
    isRegisterLoading,
    isRegisterError,
    isVerifyLoading,
    isVerifyError,
    isMeLoading,
    isMeError,
  };
};
