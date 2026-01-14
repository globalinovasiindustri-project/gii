"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { toast } from "sonner";

type ProfilePictureCardProps = {
  currentAvatar?: string | null;
  userName: string;
  onUpload: (file: File) => void;
  isUploading: boolean;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function ProfilePictureCard({
  currentAvatar,
  userName,
  onUpload,
  isUploading,
}: ProfilePictureCardProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 15MB.");
      return;
    }

    // Upload immediately
    onUpload(file);

    // Reset input
    e.target.value = "";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-fit tracking-tight border-none">
      <CardHeader>
        <CardTitle className="text-base font-medium">Foto Profil</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32 md:h-40 md:w-40">
          <AvatarImage src={currentAvatar || undefined} alt={userName} />
          <AvatarFallback className="text-3xl md:text-4xl">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            Format: JPG, PNG, WebP
          </p>
          <p className="text-sm text-muted-foreground">Maksimal: 15MB</p>
        </div>

        <label className="w-full">
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
            asChild
          >
            <span>
              <Upload className="h-4 w-4" />
              {isUploading ? "Mengunggah..." : "Pilih Foto"}
            </span>
          </Button>
        </label>
      </CardContent>
    </Card>
  );
}
