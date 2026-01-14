import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserFormInput,
  EditUserFormInput,
  userSchema,
  editUserSchema,
} from "@/lib/validations/user.validation";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string; // Database returns string, validated at API level
  isActive: boolean;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface UserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  onSave: (user: Partial<User>) => void;
  mode: "create" | "edit";
}

export function UserSheet({
  isOpen,
  onClose,
  selectedUser,
  onSave,
  mode,
}: UserSheetProps) {
  // Form & Validation
  const form = useForm<UserFormInput | EditUserFormInput>({
    resolver: zodResolver(mode === "edit" ? editUserSchema : userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user" as "user" | "admin",
    },
  });

  // Reset form when sheet opens/closes or selectedUser changes
  useEffect(() => {
    if (mode === "edit" && selectedUser) {
      form.reset({
        id: selectedUser.id,
        name: selectedUser.name || "",
        email: selectedUser.email,
        role:
          selectedUser.role === "super_admin"
            ? "admin"
            : (selectedUser.role as "user" | "admin"),
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "user",
      });
    }
  }, [mode, selectedUser, isOpen, form]);

  const handleSave = (data: UserFormInput | EditUserFormInput) => {
    onSave(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full gap-0">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>
            {mode === "edit" ? "Edit User" : "Tambahkan User"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="sheet-name">Nama</Label>
                <Input
                  id="sheet-name"
                  placeholder="Budi Santoso"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="sheet-email">Email</Label>
                <Input
                  id="sheet-email"
                  placeholder="budi@gmail.com"
                  type="email"
                  disabled={mode === "edit"}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="sheet-role">Role</Label>
                <Tabs
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue("role", value as "user" | "admin")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="user">User</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>
                </Tabs>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="flex-shrink-0 pt-4">
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSave)}
            disabled={!form.formState.isValid}
          >
            {mode === "edit" ? "Update User" : "Tambahkan User"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
