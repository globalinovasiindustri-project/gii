"use client";

import { SettingsForm } from "@/components/settings/settings-form";
import { useAppConfig, useUpdateAppConfig } from "@/hooks/use-app-config";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data, isLoading } = useAppConfig();
  const updateMutation = useUpdateAppConfig();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-2xl font-medium tracking-tight mb-6">Pengaturan</h1>
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-2xl font-medium tracking-tight mb-6">Pengaturan</h1>

      <SettingsForm
        initialData={data?.data}
        onSubmit={(formData) => updateMutation.mutate(formData)}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
