"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addressFormSchema,
  addressLabelOptions,
  type AddressFormSchema,
} from "@/lib/validations/checkout.validation";

type AddressFormProps = {
  initialData?: Partial<AddressFormSchema>;
  onSubmit: (data: AddressFormSchema) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  showDefaultCheckbox?: boolean;
};

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  showDefaultCheckbox = true,
}: AddressFormProps) {
  const form = useForm<AddressFormSchema>({
    resolver: zodResolver(addressFormSchema),
    mode: "onChange",
    defaultValues: {
      addressLabel: initialData?.addressLabel || "Rumah",
      streetAddress: initialData?.streetAddress || "",
      village: initialData?.village || "",
      district: initialData?.district || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      isDefault: initialData?.isDefault || false,
    },
  });

  const isDefaultValue = form.watch("isDefault");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup className="gap-4">
        <Field>
          <div className="group relative w-full">
            <label
              htmlFor="addressLabel"
              className="origin-start text-muted-foreground group-focus-within:text-foreground has-[:not([data-placeholder])]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[:not([data-placeholder])]:pointer-events-none has-[:not([data-placeholder])]:top-0 has-[:not([data-placeholder])]:cursor-default has-[:not([data-placeholder])]:text-xs has-[:not([data-placeholder])]:font-medium"
            >
              <span className="bg-background inline-flex px-1">
                Nama Alamat
              </span>
            </label>
            <Select
              value={form.watch("addressLabel")}
              onValueChange={(value) =>
                form.setValue(
                  "addressLabel",
                  value as AddressFormSchema["addressLabel"]
                )
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih jenis alamat" />
              </SelectTrigger>
              <SelectContent>
                {addressLabelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.formState.errors.addressLabel && (
            <p className="text-destructive text-sm">
              {form.formState.errors.addressLabel.message}
            </p>
          )}
        </Field>

        <Field>
          <div className="group relative w-full">
            <label
              htmlFor="streetAddress"
              className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+textarea:not(:placeholder-shown)]:text-foreground absolute top-4 block cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+textarea:not(:placeholder-shown)]:pointer-events-none has-[+textarea:not(:placeholder-shown)]:top-0 has-[+textarea:not(:placeholder-shown)]:cursor-default has-[+textarea:not(:placeholder-shown)]:text-xs has-[+textarea:not(:placeholder-shown)]:font-medium"
            >
              <span className="bg-background inline-flex px-1">
                Alamat Lengkap
              </span>
            </label>
            <Textarea
              id="streetAddress"
              placeholder=""
              rows={3}
              disabled={isSubmitting}
              {...form.register("streetAddress")}
            />
          </div>
          {form.formState.errors.streetAddress && (
            <p className="text-destructive text-sm">
              {form.formState.errors.streetAddress.message}
            </p>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <div className="group relative w-full">
              <label
                htmlFor="state"
                className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
              >
                <span className="bg-background inline-flex px-1">Provinsi</span>
              </label>
              <Input
                id="state"
                type="text"
                placeholder=""
                disabled={isSubmitting}
                className="h-11"
                {...form.register("state")}
              />
            </div>
            {form.formState.errors.state && (
              <p className="text-destructive text-sm">
                {form.formState.errors.state.message}
              </p>
            )}
          </Field>
          <Field>
            <div className="group relative w-full">
              <label
                htmlFor="city"
                className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
              >
                <span className="bg-background inline-flex px-1">Kota</span>
              </label>
              <Input
                id="city"
                type="text"
                placeholder=""
                disabled={isSubmitting}
                className="h-11"
                {...form.register("city")}
              />
            </div>
            {form.formState.errors.city && (
              <p className="text-destructive text-sm">
                {form.formState.errors.city.message}
              </p>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <div className="group relative w-full">
              <label
                htmlFor="village"
                className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
              >
                <span className="bg-background inline-flex px-1">
                  Kelurahan
                </span>
              </label>
              <Input
                id="village"
                type="text"
                placeholder=""
                disabled={isSubmitting}
                className="h-11"
                {...form.register("village")}
              />
            </div>
            {form.formState.errors.village && (
              <p className="text-destructive text-sm">
                {form.formState.errors.village.message}
              </p>
            )}
          </Field>
          <Field>
            <div className="group relative w-full">
              <label
                htmlFor="district"
                className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
              >
                <span className="bg-background inline-flex px-1">
                  Kecamatan
                </span>
              </label>
              <Input
                id="district"
                type="text"
                placeholder=""
                disabled={isSubmitting}
                className="h-11"
                {...form.register("district")}
              />
            </div>
            {form.formState.errors.district && (
              <p className="text-destructive text-sm">
                {form.formState.errors.district.message}
              </p>
            )}
          </Field>
        </div>

        <Field>
          <div className="group relative w-full">
            <label
              htmlFor="postalCode"
              className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
            >
              <span className="bg-background inline-flex px-1">Kode Pos</span>
            </label>
            <Input
              id="postalCode"
              type="text"
              placeholder=""
              maxLength={5}
              disabled={isSubmitting}
              className="h-11"
              {...form.register("postalCode")}
            />
          </div>
          {form.formState.errors.postalCode && (
            <p className="text-destructive text-sm">
              {form.formState.errors.postalCode.message}
            </p>
          )}
        </Field>

        {showDefaultCheckbox && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefaultValue}
              onCheckedChange={(checked) =>
                form.setValue("isDefault", checked as boolean)
              }
            />
            <Label htmlFor="isDefault" className="cursor-pointer">
              Jadikan alamat utama
            </Label>
          </div>
        )}
      </FieldGroup>

      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Menyimpan..." : "Simpan Alamat"}
        </Button>
      </div>
    </form>
  );
}
