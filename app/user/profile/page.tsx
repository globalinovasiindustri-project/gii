"use client";

import { useState } from "react";
import { useAuth, useUpdateProfile, useUploadAvatar } from "@/hooks/use-auth";
import { ProfileInfoCard } from "./_components/profile-info-card";
import { ProfilePictureCard } from "./_components/profile-picture-card";
import { EmailChangeDialog } from "./_components/email-change-dialog";
import { ProfileSkeleton } from "./_components/profile-skeleton";
import type { ProfileFormSchema } from "@/lib/validations/auth.validation";
import { toast } from "sonner";

// Container page for Profile
export default function ProfilePage() {
  const { me, isMeLoading } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Loading state
  if (isMeLoading) {
    return <ProfileSkeleton />;
  }

  const user = me?.data;

  // Handle profile form submission
  const handleSubmit = (data: ProfileFormSchema) => {
    updateProfile(data);
  };

  // Handle avatar upload
  const handleAvatarUpload = (file: File) => {
    uploadAvatar(file);
  };

  // Handle email change request
  const handleEmailChangeRequest = () => {
    setEmailDialogOpen(true);
  };

  // Handle email change confirmation
  const handleEmailChangeConfirm = () => {
    // TODO: Implement email change request API
    toast.info("Fitur ini akan segera tersedia");
    setEmailDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-2xl font-medium tracking-tight mb-6">Pengaturan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card - Left side on desktop, top on mobile */}
        <div className="lg:col-span-1">
          <ProfilePictureCard
            currentAvatar={user?.avatar}
            userName={user?.name || ""}
            onUpload={handleAvatarUpload}
            isUploading={isUploading}
          />
        </div>

        {/* Profile Info Card - Right side on desktop, bottom on mobile */}
        <div className="lg:col-span-2">
          <ProfileInfoCard
            initialData={{
              name: user?.name || "",
              email: user?.email || "",
              phone: user?.phone || null,
              dateOfBirth: user?.dateOfBirth
                ? new Date(user.dateOfBirth)
                : null,
            }}
            onSubmit={handleSubmit}
            onEmailChangeRequest={handleEmailChangeRequest}
            isSubmitting={isUpdating}
          />
        </div>
      </div>

      {/* Email Change Dialog */}
      <EmailChangeDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        onConfirm={handleEmailChangeConfirm}
        isLoading={false}
      />
    </div>
  );
}
