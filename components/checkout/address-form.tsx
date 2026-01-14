"use client";

import React, { useCallback, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
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
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import {
  addressFormSchema,
  addressLabelOptions,
  type AddressFormSchema,
} from "@/lib/validations/checkout.validation";
import {
  useProvinces,
  useRegencies,
  useDistricts,
  useVillages,
} from "@/hooks/use-locations";

// ============================================================================
// Types
// ============================================================================

export type AddressFormData = AddressFormSchema;

export type LocationData = {
  provinceCode: string;
  provinceName: string;
  regencyCode: string;
  regencyName: string;
  districtCode: string;
  districtName: string;
  villageCode: string;
  villageName: string;
};

type AddressFormProps = {
  initialData?: Partial<AddressFormData>;
  onSubmit?: (data: AddressFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showDefaultCheckbox?: boolean;
  showSubmitButton?: boolean;
  formRef?: (form: UseFormReturn<AddressFormData>) => void;
  onLocationChange?: (location: LocationData | null) => void;
};

// ============================================================================
// Address Form
// ============================================================================

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showSubmitButton = true,
  showDefaultCheckbox = true,
  formRef,
  onLocationChange,
}: AddressFormProps) {
  // Location state
  const [provinceCode, setProvinceCode] = useState<string | null>(
    initialData?.provinceCode ?? null
  );
  const [regencyCode, setRegencyCode] = useState<string | null>(
    initialData?.regencyCode ?? null
  );
  const [districtCode, setDistrictCode] = useState<string | null>(
    initialData?.districtCode ?? null
  );
  const [villageCode, setVillageCode] = useState<string | null>(
    initialData?.villageCode ?? null
  );

  // Location queries
  const { data: provinces, isLoading: loadingProvinces } = useProvinces();
  const { data: regencies, isLoading: loadingRegencies } =
    useRegencies(provinceCode);
  const { data: districts, isLoading: loadingDistricts } =
    useDistricts(regencyCode);
  const { data: villages, isLoading: loadingVillages } =
    useVillages(districtCode);

  const form = useForm<AddressFormData>({
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
      provinceCode: initialData?.provinceCode,
      regencyCode: initialData?.regencyCode,
      districtCode: initialData?.districtCode,
      villageCode: initialData?.villageCode,
    },
  });

  const isDefaultValue = form.watch("isDefault");

  if (formRef) {
    formRef(form);
  }

  const emitLocation = useCallback(
    (newVillageCode: string | null) => {
      const province = provinces?.find((p) => p.code === provinceCode);
      const regency = regencies?.find((r) => r.code === regencyCode);
      const district = districts?.find((d) => d.code === districtCode);
      const village = villages?.find((v) => v.code === newVillageCode);

      if (province && regency && district && village) {
        const locationData: LocationData = {
          provinceCode: province.code,
          provinceName: province.name,
          regencyCode: regency.code,
          regencyName: regency.name,
          districtCode: district.code,
          districtName: district.name,
          villageCode: village.code,
          villageName: village.name,
        };

        form.setValue("provinceCode", locationData.provinceCode);
        form.setValue("regencyCode", locationData.regencyCode);
        form.setValue("districtCode", locationData.districtCode);
        form.setValue("villageCode", locationData.villageCode);
        form.setValue("state", locationData.provinceName);
        form.setValue("city", locationData.regencyName);
        form.setValue("district", locationData.districtName);
        form.setValue("village", locationData.villageName);

        onLocationChange?.(locationData);
      } else {
        onLocationChange?.(null);
      }
    },
    [
      provinces,
      regencies,
      districts,
      villages,
      provinceCode,
      regencyCode,
      districtCode,
      form,
      onLocationChange,
    ]
  );

  const clearLocationValues = useCallback(() => {
    form.setValue("provinceCode", undefined);
    form.setValue("regencyCode", undefined);
    form.setValue("districtCode", undefined);
    form.setValue("villageCode", undefined);
    form.setValue("state", "");
    form.setValue("city", "");
    form.setValue("district", "");
    form.setValue("village", "");
    onLocationChange?.(null);
  }, [form, onLocationChange]);

  const handleProvinceChange = (value: string) => {
    setProvinceCode(value);
    setRegencyCode(null);
    setDistrictCode(null);
    setVillageCode(null);
    clearLocationValues();
  };

  const handleRegencyChange = (value: string) => {
    setRegencyCode(value);
    setDistrictCode(null);
    setVillageCode(null);
    clearLocationValues();
  };

  const handleDistrictChange = (value: string) => {
    setDistrictCode(value);
    setVillageCode(null);
    clearLocationValues();
  };

  const handleVillageChange = (value: string) => {
    setVillageCode(value);
    emitLocation(value);
  };

  // Watch postal code and trigger location emit when it's valid (5 digits)
  const postalCodeValue = form.watch("postalCode");
  const hasEmittedRef = React.useRef(false);

  // Trigger location emit when postal code is complete and all location fields are filled
  React.useEffect(() => {
    if (
      postalCodeValue &&
      /^\d{5}$/.test(postalCodeValue) &&
      villageCode &&
      provinceCode &&
      regencyCode &&
      districtCode &&
      !hasEmittedRef.current
    ) {
      hasEmittedRef.current = true;
      emitLocation(villageCode);
    }

    // Reset flag when location changes
    if (!villageCode || !postalCodeValue || !/^\d{5}$/.test(postalCodeValue)) {
      hasEmittedRef.current = false;
    }
  }, [postalCodeValue, villageCode, provinceCode, regencyCode, districtCode]);

  return (
    <form
      onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}
      className="space-y-4"
    >
      {/* Row 1: Nama Alamat, Provinsi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                form.setValue("addressLabel", value as any)
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
          <FloatingLabelSelect
            id="province"
            label="Provinsi"
            value={provinceCode}
            onValueChange={handleProvinceChange}
            disabled={isSubmitting}
            isLoading={loadingProvinces}
          >
            {provinces?.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.name}
              </SelectItem>
            ))}
          </FloatingLabelSelect>
          {form.formState.errors.state && (
            <p className="text-destructive text-sm">
              {form.formState.errors.state.message}
            </p>
          )}
        </Field>
      </div>

      {/* Row 2: Kota, Kecamatan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FloatingLabelSelect
            id="regency"
            label="Kota/Kabupaten"
            value={regencyCode}
            onValueChange={handleRegencyChange}
            disabled={isSubmitting || !provinceCode}
            isLoading={loadingRegencies}
          >
            {regencies?.map((r) => (
              <SelectItem key={r.code} value={r.code}>
                {r.name}
              </SelectItem>
            ))}
          </FloatingLabelSelect>
          {form.formState.errors.city && (
            <p className="text-destructive text-sm">
              {form.formState.errors.city.message}
            </p>
          )}
        </Field>

        <Field>
          <FloatingLabelSelect
            id="district"
            label="Kecamatan"
            value={districtCode}
            onValueChange={handleDistrictChange}
            disabled={isSubmitting || !regencyCode}
            isLoading={loadingDistricts}
          >
            {districts?.map((d) => (
              <SelectItem key={d.code} value={d.code}>
                {d.name}
              </SelectItem>
            ))}
          </FloatingLabelSelect>
          {form.formState.errors.district && (
            <p className="text-destructive text-sm">
              {form.formState.errors.district.message}
            </p>
          )}
        </Field>
      </div>

      {/* Row 3: Kelurahan, Kode Pos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FloatingLabelSelect
            id="village"
            label="Kelurahan"
            value={villageCode}
            onValueChange={handleVillageChange}
            disabled={isSubmitting || !districtCode}
            isLoading={loadingVillages}
          >
            {villages?.map((v) => (
              <SelectItem key={v.code} value={v.code}>
                {v.name}
              </SelectItem>
            ))}
          </FloatingLabelSelect>
          {form.formState.errors.village && (
            <p className="text-destructive text-sm">
              {form.formState.errors.village.message}
            </p>
          )}
        </Field>

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
      </div>

      {/* Row 4: Nama Jalan (full width) */}
      <Field>
        <FloatingLabelTextarea
          id="streetAddress"
          label="Nama Jalan"
          rows={3}
          disabled={isSubmitting}
          {...form.register("streetAddress")}
        />
        {form.formState.errors.streetAddress && (
          <p className="text-destructive text-sm">
            {form.formState.errors.streetAddress.message}
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

      {showSubmitButton && (
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
            {isSubmitting ? "Menyimpan Alamat..." : "Simpan Alamat"}
          </Button>
        </div>
      )}
    </form>
  );
}
