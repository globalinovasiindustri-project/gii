"use client";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormInput, loginSchema } from "@/lib/validations/auth.validation";
import { useLogin } from "@/hooks/use-auth";

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
import { emailService } from "@/lib/services/email.service";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // Form & Validation
  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
  });

  // Login mutation
  const loginMutation = useLogin();

  const onSubmit = async (data: LoginFormInput) => {
    await loginMutation.mutate(data);
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
              Masuk ke BeliElektronik.
            </h1>
            <FieldDescription>
              Belum punya akun? <Link href="/auth/register">Daftar</Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              size={"lg"}
              placeholder="budi@gmail.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              size={"lg"}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? "Mengirim Magic Link"
                : "Kirim Magic Link"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      {/* <FieldDescription className="text-center">
        Lupa password? <Link href="/auth/reset-pw">Klik di sini</Link>
      </FieldDescription> */}
    </div>
  );
}
