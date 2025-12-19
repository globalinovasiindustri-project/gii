"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  profileFormSchema,
  type ProfileFormSchema,
} from "@/lib/validations/auth.validation";

type ProfileFormProps = {
  initialData: {
    name: string;
    email: string;
    phone: string | null;
  };
  onSubmit: (data: ProfileFormSchema) => void;
  isSubmitting: boolean;
};

// Presentational component for profile form (Requirement 4.3, 4.4, 4.5)
export function ProfileForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone || "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup className="gap-4">
        {/* Name field - editable (Requirement 4.3) */}
        <Field>
          <div className="group relative w-full">
            <label
              htmlFor="name"
              className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
            >
              <span className="bg-background inline-flex px-1">Nama</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder=""
              disabled={isSubmitting}
              className="h-11"
              {...form.register("name")}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-destructive text-sm">
              {form.formState.errors.name.message}
            </p>
          )}
        </Field>

        {/* Email field - read-only (Requirement 4.5) */}
        <Field>
          <div className="group relative w-full">
            <label
              htmlFor="email"
              className="origin-start text-muted-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
            >
              <span className="bg-background inline-flex px-1">Email</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder=""
              disabled={true}
              className="h-11 bg-muted cursor-not-allowed"
              {...form.register("email")}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Email tidak dapat diubah
          </p>
        </Field>

        {/* Phone field - editable with format validation (Requirement 4.4) */}
        <Field>
          <div className="group relative w-full">
            <label
              htmlFor="phone"
              className="origin-start text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
            >
              <span className="bg-background inline-flex px-1">
                Nomor Telepon
              </span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder=""
              disabled={isSubmitting}
              className="h-11"
              {...form.register("phone")}
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-destructive text-sm">
              {form.formState.errors.phone.message}
            </p>
          )}
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting || !form.formState.isDirty}
        className="w-full"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
