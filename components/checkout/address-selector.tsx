"use client";

import { useState } from "react";
import { SelectAddress } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import { AddressForm, AddressFormData } from "./address-form";
import { useAddresses } from "@/hooks/use-addresses";
import { Pencil, Trash2, Star } from "lucide-react";

interface AddressSelectorProps {
  addresses: SelectAddress[];
  selectedAddressId?: string;
  onSelectAddress: (addressId: string) => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
}: AddressSelectorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SelectAddress | null>(
    null
  );
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null
  );

  const {
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isCreating,
    isUpdating,
    isDeleting,
    isSettingDefault,
  } = useAddresses();

  const handleCreateAddress = (data: AddressFormData) => {
    createAddress(data, {
      onSuccess: () => {
        setShowAddDialog(false);
      },
    });
  };

  const handleUpdateAddress = (data: AddressFormData) => {
    if (!editingAddress) return;

    updateAddress(
      { id: editingAddress.id, data },
      {
        onSuccess: () => {
          setEditingAddress(null);
        },
      }
    );
  };

  const handleDeleteAddress = () => {
    if (!deletingAddressId) return;

    deleteAddress(deletingAddressId, {
      onSuccess: () => {
        setDeletingAddressId(null);
        // If deleted address was selected, clear selection
        if (selectedAddressId === deletingAddressId) {
          onSelectAddress("");
        }
      },
    });
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress(addressId);
  };

  // Handle empty state
  if (addresses.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Anda belum memiliki alamat tersimpan
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            Tambah Alamat Baru
          </Button>
        </Card>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Alamat Baru</DialogTitle>
            </DialogHeader>
            <AddressForm
              onSubmit={handleCreateAddress}
              onCancel={() => setShowAddDialog(false)}
              isSubmitting={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pilih Alamat Pengiriman</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddDialog(true)}
        >
          Tambah Alamat Baru
        </Button>
      </div>

      <RadioGroup
        value={selectedAddressId}
        onValueChange={onSelectAddress}
        className="space-y-3"
      >
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedAddressId === address.id
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelectAddress(address.id)}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem
                value={address.id}
                id={address.id}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={address.id}
                    className="font-semibold cursor-pointer"
                  >
                    {address.addressLabel}
                  </Label>
                  {address.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Utama
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{address.streetAddress}</p>
                  <p>
                    {address.village}, {address.district}, {address.city},{" "}
                    {address.state} {address.postalCode}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(address);
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingAddressId(address.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Hapus
                  </Button>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      disabled={isSettingDefault}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Jadikan Utama
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </RadioGroup>

      {/* Add Address Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Alamat Baru</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSubmit={handleCreateAddress}
            onCancel={() => setShowAddDialog(false)}
            isSubmitting={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog
        open={!!editingAddress}
        onOpenChange={(open) => !open && setEditingAddress(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Alamat</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <AddressForm
              initialData={{
                addressLabel:
                  editingAddress.addressLabel as AddressFormData["addressLabel"],
                streetAddress: editingAddress.streetAddress,
                village: editingAddress.village,
                district: editingAddress.district,
                city: editingAddress.city,
                state: editingAddress.state,
                postalCode: editingAddress.postalCode,
                isDefault: editingAddress.isDefault,
                provinceCode: editingAddress.provinceCode ?? undefined,
                regencyCode: editingAddress.regencyCode ?? undefined,
                districtCode: editingAddress.districtCode ?? undefined,
                villageCode: editingAddress.villageCode ?? undefined,
              }}
              onSubmit={handleUpdateAddress}
              onCancel={() => setEditingAddress(null)}
              isSubmitting={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAddressId}
        onOpenChange={(open) => !open && setDeletingAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Alamat</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
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
