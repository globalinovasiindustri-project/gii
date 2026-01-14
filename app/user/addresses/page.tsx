"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAddresses } from "@/hooks/use-addresses";
import { AddressCard } from "./_components/address-card";
import { AddressForm } from "./_components/address-form";
import { AddressesEmptyState } from "./_components/addresses-empty-state";
import { AddressesSkeleton } from "./_components/addresses-skeleton";
import type { SelectAddress } from "@/lib/db/schema";
import type { AddressFormSchema } from "@/lib/validations/checkout.validation";

type DialogMode = "add" | "edit" | null;

export default function AddressesPage() {
  const {
    addresses,
    isLoading,
    createAddress,
    isCreating,
    updateAddress,
    isUpdating,
    deleteAddress,
    isDeleting,
    setDefaultAddress,
    isSettingDefault,
  } = useAddresses();

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedAddress, setSelectedAddress] = useState<SelectAddress | null>(
    null
  );
  const [addressToDelete, setAddressToDelete] = useState<SelectAddress | null>(
    null
  );

  // Loading state
  if (isLoading) {
    return <AddressesSkeleton />;
  }

  const addressList = addresses || [];

  // Empty state (Requirement 3.7)
  if (addressList.length === 0) {
    return <AddressesEmptyState onAddAddress={() => setDialogMode("add")} />;
  }

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setDialogMode("add");
  };

  const handleEditAddress = (address: SelectAddress) => {
    setSelectedAddress(address);
    setDialogMode("edit");
  };

  const handleDeleteAddress = (address: SelectAddress) => {
    setAddressToDelete(address);
  };

  const handleSetDefault = (address: SelectAddress) => {
    setDefaultAddress(address.id);
  };

  const handleFormSubmit = (data: AddressFormSchema) => {
    if (dialogMode === "add") {
      createAddress(data, {
        onSuccess: () => {
          setDialogMode(null);
        },
      });
    } else if (dialogMode === "edit" && selectedAddress) {
      updateAddress(
        { id: selectedAddress.id, data },
        {
          onSuccess: () => {
            setDialogMode(null);
            setSelectedAddress(null);
          },
        }
      );
    }
  };

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      deleteAddress(addressToDelete.id, {
        onSuccess: () => {
          setAddressToDelete(null);
        },
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl tracking-tight">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium mb-6">Alamat Saya</h1>
        <Button onClick={handleAddAddress}>
          <Plus className="size-4" />
          Tambah Alamat
        </Button>
      </div>

      {/* Address list (Requirement 3.1) */}
      <div className="grid gap-4 md:grid-cols-2">
        {addressList.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
            onSetDefault={handleSetDefault}
            isSettingDefault={isSettingDefault}
          />
        ))}
      </div>

      {/* Add/Edit Address Dialog (Requirement 3.2, 3.4) */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && setDialogMode(null)}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Tambah Alamat Baru" : "Edit Alamat"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Isi form di bawah untuk menambahkan alamat baru"
                : "Ubah informasi alamat Anda"}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            initialData={
              dialogMode === "edit" && selectedAddress
                ? {
                    addressLabel:
                      selectedAddress.addressLabel as AddressFormSchema["addressLabel"],
                    streetAddress: selectedAddress.streetAddress,
                    village: selectedAddress.village,
                    district: selectedAddress.district,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    postalCode: selectedAddress.postalCode,
                    isDefault: selectedAddress.isDefault,
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogMode(null)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (Requirement 3.5) */}
      <AlertDialog
        open={addressToDelete !== null}
        onOpenChange={(open) => !open && setAddressToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Alamat?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus alamat &quot;
              {addressToDelete?.addressLabel}&quot;? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
