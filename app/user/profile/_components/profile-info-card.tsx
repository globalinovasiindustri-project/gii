"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  profileFormSchema,
  type ProfileFormSchema,
} from "@/lib/validations/auth.validation";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

type ProfileInfoCardProps = {
  initialData: {
    name: string;
    email: string;
    phone: string | null;
    dateOfBirth: Date | null;
  };
  onSubmit: (data: ProfileFormSchema) => void;
  onEmailChangeRequest: () => void;
  isSubmitting: boolean;
};

export function ProfileInfoCard({
  initialData,
  onSubmit,
  onEmailChangeRequest,
  isSubmitting,
}: ProfileInfoCardProps) {
  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone || "",
      dateOfBirth: initialData.dateOfBirth || undefined,
    },
  });

  return (
    <Card className="h-full tracking-tight border-none">
      <CardHeader>
        <CardTitle className="text-base font-medium">Informasi Saya</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            {/* Email field - disabled with change button */}
            <Field>
              <div className="space-y-2">
                <div className="group relative w-full">
                  <label className="text-sm">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    disabled={true}
                    className="h-11 bg-muted cursor-not-allowed hidden"
                    {...form.register("email")}
                  />
                </div>
                <div className="flex space-x-2">
                  <p className="font-medium">{initialData.email}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs text-primary"
                    onClick={onEmailChangeRequest}
                  >
                    Ubah email
                  </Button>
                </div>
              </div>
            </Field>

            {/* Name field */}
            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Nama</label>
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

            {/* Phone field */}
            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1"> Nomor Handphone</label>
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

            {/* Date of Birth field */}
            <Field>
              <div className="group relative w-full">
                <label className="text-sm mb-1">Tanggal Lahir</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !form.watch("dateOfBirth") && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("dateOfBirth") ? (
                        formatDate(form.watch("dateOfBirth")!)
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("dateOfBirth") || undefined}
                      onSelect={(date) =>
                        form.setValue("dateOfBirth", date || null, {
                          shouldDirty: true,
                        })
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
            className="w-full md:max-w-[144px]"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
