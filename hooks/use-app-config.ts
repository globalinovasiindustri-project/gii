import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SettingsSchema } from "@/lib/validations/settings.validation";

const appConfigApi = {
  getConfig: async () => {
    const response = await fetch("/api/admin/settings");
    if (!response.ok) throw new Error("Gagal mengambil pengaturan");
    return response.json();
  },

  updateConfig: async (data: SettingsSchema) => {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal menyimpan pengaturan");
    return response.json();
  },
};

export function useAppConfig() {
  return useQuery({
    queryKey: ["app-config"],
    queryFn: appConfigApi.getConfig,
  });
}

export function useUpdateAppConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appConfigApi.updateConfig,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["app-config"] });
      toast.success(response.message || "Pengaturan berhasil disimpan");
    },
    onError: () => {
      toast.error("Gagal menyimpan pengaturan");
    },
  });
}
