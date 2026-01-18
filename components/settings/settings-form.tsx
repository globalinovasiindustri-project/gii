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
import { ImageIcon } from "lucide-react";

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
      socialTwitter: "",
      socialFacebook: "",
      socialInstagram: "",
      socialTiktok: "",
      socialWhatsapp: "",
      shippingOriginAddress: "",
      shippingOriginCity: "",
      shippingOriginProvince: "",
      shippingOriginPostalCode: "",
      taxPercentage: 11,
      pendingOrderTimeLimitHours: 24,
    },
  });

  const heroImages = form.watch("heroImages") || [];

  const handleHeroImagesChange = (newImages: string[]) => {
    form.setValue("heroImages", newImages);
  };

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
                <div className="border rounded-lg p-4 bg-muted/30">
                  {heroImages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Belum ada gambar hero</p>
                      <p className="text-xs mt-1">
                        Upload gambar untuk carousel landing page
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {heroImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={`Hero ${index + 1}`}
                            className="w-full aspect-video object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = heroImages.filter(
                                (_, i) => i !== index,
                              );
                              handleHeroImagesChange(newImages);
                            }}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {form.formState.errors.heroImages && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.heroImages.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload maksimal 5 gambar untuk carousel hero (fitur upload
                  akan diintegrasikan)
                </p>
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
                <label className="text-sm mb-1">Twitter</label>
                <Input
                  id="socialTwitter"
                  type="url"
                  placeholder="https://twitter.com/username"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("socialTwitter")}
                />
              </div>
              {form.formState.errors.socialTwitter && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.socialTwitter.message}
                </p>
              )}
            </Field>

            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Facebook</label>
                <Input
                  id="socialFacebook"
                  type="url"
                  placeholder="https://facebook.com/username"
                  disabled={isSubmitting}
                  className="h-11"
                  {...form.register("socialFacebook")}
                />
              </div>
              {form.formState.errors.socialFacebook && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.socialFacebook.message}
                </p>
              )}
            </Field>

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
            Pengaturan Lainnya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
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
