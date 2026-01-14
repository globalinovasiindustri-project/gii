"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EmailChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
};

export function EmailChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: EmailChangeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ubah Email</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Link untuk mengubah email akan dikirim ke alamat email Anda saat
              ini.
            </p>
            <p>
              Silakan periksa inbox email Anda dan ikuti instruksi yang
              diberikan untuk menyelesaikan proses perubahan email.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Mengirim..." : "Kirim Link"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
