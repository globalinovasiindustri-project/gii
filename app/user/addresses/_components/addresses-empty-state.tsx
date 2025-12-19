"use client";

import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type AddressesEmptyStateProps = {
  onAddAddress: () => void;
};

export function AddressesEmptyState({
  onAddAddress,
}: AddressesEmptyStateProps) {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Alamat Saya</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Belum ada alamat</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Tambahkan alamat pengiriman untuk mempermudah proses checkout
        </p>
        <Button onClick={onAddAddress}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Alamat
        </Button>
      </div>
    </div>
  );
}
