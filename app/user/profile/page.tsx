"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-auth";
import { ProfileForm } from "./_components/profile-form";
import { ProfileSkeleton } from "./_components/profile-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProfileFormSchema } from "@/lib/validations/auth.validation";

// Container page for Profile (Requirement 4.1, 4.2)
export default function ProfilePage() {
  const { me, isMeLoading } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Loading state
  if (isMeLoading) {
    return <ProfileSkeleton />;
  }

  const user = me?.data;

  // Handle form submission (Requirement 4.3, 4.4)
  const handleSubmit = (data: ProfileFormSchema) => {
    updateProfile(data);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Kelola informasi profil Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialData={{
              name: user?.name || "",
              email: user?.email || "",
              phone: user?.phone || "",
            }}
            onSubmit={handleSubmit}
            isSubmitting={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  );
}
