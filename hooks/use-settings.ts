import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SettingsSchema } from "@/lib/validations/settings.validation";

const settingsApi = {
  getSettings: async (): Promise<{
    success: boolean;
    data: SettingsSchema;
  }> => {
    const response = await fetch("/api/admin/settings");
    if (!response.ok) throw new Error("Failed to fetch settings");
    return response.json();
  },

  updateSettings: async (
    data: SettingsSchema,
  ): Promise<{ success: boolean; data: SettingsSchema }> => {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update settings");
    return response.json();
  },
};

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.getSettings(),
    select: (response) => response.data,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Pengaturan berhasil disimpan!");
    },
    onError: () => {
      toast.error("Gagal menyimpan pengaturan");
    },
  });
}
