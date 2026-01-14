"use client";

import { Edit, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SelectAddress } from "@/lib/db/schema";

type AddressCardProps = {
  address: SelectAddress;
  onEdit: (address: SelectAddress) => void;
  onDelete: (address: SelectAddress) => void;
  onSetDefault: (address: SelectAddress) => void;
  isSettingDefault?: boolean;
};

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
}: AddressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3 tracking-tight">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">
              {address.addressLabel}
            </CardTitle>
          </div>
          {address.isDefault && (
            <Badge variant="secondary" className="shrink-0">
              Utama
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="">{address.streetAddress}</p>
        <p className="text-sm text-muted-foreground">
          {[address.village, address.district].filter(Boolean).join(", ")}
        </p>
        <p className="text-sm text-muted-foreground">
          {address.city}, {address.state} {address.postalCode}
        </p>

        <div className="flex flex-wrap gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(address)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus
            </Button>
          )}
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(address)}
              disabled={isSettingDefault}
            >
              <Star className="h-4 w-4 mr-1" />
              {isSettingDefault ? "Menyimpan..." : "Jadikan Utama"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
