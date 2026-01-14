"use client";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterFormInput,
  registerSchema,
} from "@/lib/validations/auth.validation";

import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface RegisterFormProps extends React.ComponentProps<"div"> {
  className?: string;
  registerMutation: {
    mutate: (data: RegisterFormInput) => void;
    isPending: boolean;
  };
}

export function RegisterForm({
  className,
  registerMutation,
  ...props
}: RegisterFormProps) {
  // Form & Validation
  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
  });

  // Handle form submission
  const onSubmit = async (data: RegisterFormInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-2xl font-semibold tracking-tight">
              Daftar ke BeliElektronik.
            </h1>
            <FieldDescription>
              Sudah punya akun? <Link href="/auth">Masuk</Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Nama</FieldLabel>
            <Input
              id="name"
              type="text"
              size={"lg"}
              placeholder="Budi Santoso"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              size={"lg"}
              placeholder="budi@gmail.com"
              required
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </Field>
          <Field>
            <Button
              type="submit"
              size={"lg"}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Mendaftar..." : "Mulai Belanja"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Dengan mendaftar ke BeliElektronik, Anda menyetujui{" "}
        <a href="#">Kebijakan Layanan</a> and <a href="#">Kebijakan Privasi</a>.
      </FieldDescription>
    </div>
  );
}
