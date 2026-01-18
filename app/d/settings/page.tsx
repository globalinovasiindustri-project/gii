"use client";

import { SettingsForm } from "@/components/settings/settings-form";
import type { SettingsSchema } from "@/lib/validations/settings.validation";
import { toast } from "sonner";

export default function SettingsPage() {
  // TODO: Replace with actual hook when API is ready
  // const { data, isLoading } = useSettings();
  // const updateMutation = useUpdateSettings();

  const handleSubmit = (data: SettingsSchema) => {
    console.log("Settings data:", data);
    // TODO: Replace with actual mutation
    // updateMutation.mutate(data);
    toast.success("Pengaturan berhasil disimpan!");
  };

  // TODO: Add loading state
  // if (isLoading) return <SettingsFormSkeleton />;

  // Mock initial data for UI preview
  const mockData: SettingsSchema = {
    heroImages: [],
    contactPhone: "08123456789",
    contactEmail: "admin@toko.com",
    socialTwitter: "",
    socialFacebook: "",
    socialInstagram: "",
    socialTiktok: "",
    socialWhatsapp: "",
    shippingOriginAddress: "Jl. Contoh No. 123",
    shippingOriginCity: "Jakarta Selatan",
    shippingOriginProvince: "DKI Jakarta",
    shippingOriginPostalCode: "12345",
    taxPercentage: 11,
    pendingOrderTimeLimitHours: 24,
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-2xl font-medium tracking-tight mb-6">Pengaturan</h1>

      <SettingsForm
        initialData={mockData}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </div>
  );
}
