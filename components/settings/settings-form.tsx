"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  type SettingsSchema,
} from "@/lib/validations/settings.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ImageIcon } from "lucide-react";
import {
  Dropzone,
  DropZoneArea,
  DropzoneDescription,
  DropzoneMessage,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import { uploadFileWithRetry } from "@/lib/upload-utils";
import { CloudUploadIcon, Trash2Icon } from "lucide-react";

interface SettingsFormProps {
  initialData?: SettingsSchema;
  onSubmit: (data: SettingsSchema) => void;
  isSubmitting: boolean;
}

export function SettingsForm({
  initialData,
  onSubmit,
  isSubmitting,
}: SettingsFormProps) {
  const form = useForm<SettingsSchema>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData || {
      heroImages: [],
      contactPhone: "",
      contactEmail: "",
      socialInstagram: "",
      socialTiktok: "",
      socialWhatsapp: "",
      shippingOriginAddress: "",
      shippingOriginCity: "",
      shippingOriginProvince: "",
      shippingOriginPostalCode: "",
      taxEnabled: false,
      taxPercentage: 11,
      pendingOrderTimeLimitHours: 24,
    },
  });

  const heroImages = form.watch("heroImages") || [];

  const handleRemoveImage = (index: number) => {
    const updatedImages = heroImages.filter((_, idx) => idx !== index);
    form.setValue("heroImages", updatedImages);
  };

  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      try {
        const result = await uploadFileWithRetry(file, 3, (progress) => {
          console.log(
            `Uploading ${progress.fileName}: ${progress.progress.toFixed(0)}%`,
          );
        });

        // Add newly uploaded image
        const currentImages = form.getValues("heroImages") || [];
        form.setValue("heroImages", [...currentImages, result.url]);

        return {
          status: "success",
          result: result.url,
        };
      } catch (error) {
        console.error("Upload failed:", error);
        return {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxSize: 50 * 1024 * 1024,
      maxFiles: 5,
    },
    maxRetryCount: 3,
    autoRetry: true,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Hero Images */}
      <Card className="border tracking-tight">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Gambar Landing Page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <div className="space-y-2">
                <label className="text-sm">Gambar Hero</label>

                <Dropzone {...dropzone}>
                  <div>
                    <div className="flex justify-between mb-2">
                      <DropzoneDescription>
                        Upload maksimal 5 gambar untuk carousel hero
                      </DropzoneDescription>
                      <DropzoneMessage />
                    </div>
                    {heroImages.length < 5 && (
                      <DropZoneArea>
                        <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-8 text-center text-sm">
                          <CloudUploadIcon className="size-5" />
                          <div>
                            <p className="font-medium">Upload gambar hero</p>
                            <p className="text-sm text-muted-foreground">
                              Klik di sini atau tarik gambar untuk mengunggah
                            </p>
                          </div>
                        </DropzoneTrigger>
                      </DropZoneArea>
                    )}
                  </div>

                  {/* Display uploaded images */}
                  {(heroImages.length > 0 ||
                    dropzone.fileStatuses.some(
                      (f) => f.status === "pending",
                    )) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {/* Existing images */}
                      {heroImages.map((imageUrl, index) => (
                        <div
                          key={`hero-${index}`}
                          className="overflow-hidden rounded-md bg-secondary shadow-sm relative"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={`Hero ${index + 1}`}
                            className="aspect-video object-cover"
                          />
                          <div className="flex items-center justify-between p-2">
                            <p className="text-sm truncate">Hero {index + 1}</p>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="shrink-0 hover:bg-accent rounded-md p-1.5"
                              disabled={isSubmitting}
                            >
                              <Trash2Icon className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Pending uploads */}
                      {dropzone.fileStatuses
                        .filter((file) => file.status === "pending")
                        .map((file) => (
                          <div
                            key={file.id}
                            className="overflow-hidden rounded-md bg-secondary shadow-sm"
                          >
                            <div className="relative aspect-video">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={URL.createObjectURL(file.file)}
                                alt={`preview-${file.fileName}`}
                                className="aspect-video object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                                  <p className="text-xs text-white">
                                    Uploading...
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="p-2">
                              <p className="text-sm truncate">
                                {file.fileName}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </Dropzone>

                {form.formState.errors.heroImages && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.heroImages.message}
                  </p>
                )}
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="border tracking-tight">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Informasi Kontak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Nomor Telepon</label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="08123456789"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("contactPhone")}
                />
              </div>
              {form.formState.errors.contactPhone && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.contactPhone.message}
                </p>
              )}
            </Field>

            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Email</label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="admin@toko.com"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("contactEmail")}
                />
              </div>
              {form.formState.errors.contactEmail && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.contactEmail.message}
                </p>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card className="border tracking-tight">
        <CardHeader>
          <CardTitle className="text-base font-medium">Media Sosial</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Instagram</label>
                <Input
                  id="socialInstagram"
                  type="url"
                  placeholder="https://instagram.com/username"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("socialInstagram")}
                />
              </div>
              {form.formState.errors.socialInstagram && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.socialInstagram.message}
                </p>
              )}
            </Field>

            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">TikTok</label>
                <Input
                  id="socialTiktok"
                  type="url"
                  placeholder="https://tiktok.com/@username"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("socialTiktok")}
                />
              </div>
              {form.formState.errors.socialTiktok && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.socialTiktok.message}
                </p>
              )}
            </Field>

            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">WhatsApp</label>
                <Input
                  id="socialWhatsapp"
                  type="tel"
                  placeholder="628123456789 (tanpa tanda +)"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("socialWhatsapp")}
                />
              </div>
              {form.formState.errors.socialWhatsapp && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.socialWhatsapp.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Nomor WhatsApp untuk link chat langsung (format: 628123456789)
              </p>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Shipping Origin */}
      <Card className="border tracking-tight">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Alamat Asal Pengiriman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Alamat Lengkap</label>
                <Textarea
                  id="shippingOriginAddress"
                  placeholder="Jl. Contoh No. 123"
                  rows={3}
                  disabled={isSubmitting}
                  className="resize-none"
                  {...form.register("shippingOriginAddress")}
                />
              </div>
              {form.formState.errors.shippingOriginAddress && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.shippingOriginAddress.message}
                </p>
              )}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <div className="group relative w-full">
                  <label className="text-sm mb-1">Kota/Kabupaten</label>
                  <Input
                    id="shippingOriginCity"
                    placeholder="Jakarta Selatan"
                    disabled={isSubmitting}
                    className="h-11"
                    {...form.register("shippingOriginCity")}
                  />
                </div>
                {form.formState.errors.shippingOriginCity && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.shippingOriginCity.message}
                  </p>
                )}
              </Field>

              <Field>
                <div className="group relative w-full">
                  <label className="text-sm mb-1">Provinsi</label>
                  <Input
                    id="shippingOriginProvince"
                    placeholder="DKI Jakarta"
                    disabled={isSubmitting}
                    className="h-11"
                    {...form.register("shippingOriginProvince")}
                  />
                </div>
                {form.formState.errors.shippingOriginProvince && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.shippingOriginProvince.message}
                  </p>
                )}
              </Field>
            </div>

            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Kode Pos</label>
                <Input
                  id="shippingOriginPostalCode"
                  placeholder="12345"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("shippingOriginPostalCode")}
                />
              </div>
              {form.formState.errors.shippingOriginPostalCode && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.shippingOriginPostalCode.message}
                </p>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Tax & Order Settings */}
      <Card className="border tracking-tight">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Pengaturan Pajak & Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Mode Pajak</label>
                  <p className="text-xs text-muted-foreground">
                    Aktifkan untuk menambahkan pajak ke semua pesanan
                  </p>
                </div>
                <Switch
                  checked={form.watch("taxEnabled")}
                  onCheckedChange={(checked) =>
                    form.setValue("taxEnabled", checked)
                  }
                  disabled={isSubmitting}
                />
              </div>
            </Field>

            {form.watch("taxEnabled") && (
              <Field>
                <div className="group relative w-full">
                  <label className="text-sm mb-1">Persentase Pajak (%)</label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="11"
                    disabled={isSubmitting}
                    className="h-11"
                    {...form.register("taxPercentage", { valueAsNumber: true })}
                  />
                </div>
                {form.formState.errors.taxPercentage && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.taxPercentage.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Pajak yang akan ditambahkan ke total pesanan (PPN)
                </p>
              </Field>
            )}

            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">
                  Batas Waktu Pesanan Pending (Jam)
                </label>
                <Input
                  id="pendingOrderTimeLimitHours"
                  type="number"
                  min="1"
                  max="168"
                  placeholder="24"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("pendingOrderTimeLimitHours", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              {form.formState.errors.pendingOrderTimeLimitHours && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.pendingOrderTimeLimitHours.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Pesanan pending akan otomatis dibatalkan setelah waktu ini
                terlewati
              </p>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isDirty}
          className="w-full md:max-w-[144px]"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
