"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  ORDER_STATUS,
  type UpdateOrderStatusSchema,
} from "@/lib/validations/order.validation";

interface StatusUpdateSectionProps {
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentCarrier?: string | null;
  onSubmit: (data: UpdateOrderStatusSchema) => void;
  isSubmitting: boolean;
}

const STATUS_OPTIONS = [
  { value: ORDER_STATUS.PENDING, label: "Pending" },
  { value: ORDER_STATUS.SHIPPED, label: "Shipped" },
  { value: ORDER_STATUS.DELIVERED, label: "Delivered" },
  { value: ORDER_STATUS.CANCELLED, label: "Cancelled" },
] as const;

export function StatusUpdateSection({
  currentStatus,
  currentTrackingNumber,
  currentCarrier,
  onSubmit,
  isSubmitting,
}: StatusUpdateSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(
    currentTrackingNumber || ""
  );
  const [carrier, setCarrier] = useState(currentCarrier || "");
  const [cancellationReason, setCancellationReason] = useState("");

  const isStatusChanged = selectedStatus !== currentStatus;
  const showTrackingFields = selectedStatus === ORDER_STATUS.SHIPPED;
  const showCancellationField = selectedStatus === ORDER_STATUS.CANCELLED;

  const handleSubmit = () => {
    const data: UpdateOrderStatusSchema = {
      orderStatus: selectedStatus as UpdateOrderStatusSchema["orderStatus"],
    };

    if (showTrackingFields) {
      if (trackingNumber.trim()) data.trackingNumber = trackingNumber.trim();
      if (carrier.trim()) data.carrier = carrier.trim();
    }

    if (showCancellationField && cancellationReason.trim()) {
      data.cancellationReason = cancellationReason.trim();
    }

    onSubmit(data);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-medium">Update Status</h3>

      {/* Status Dropdown */}
      <div className="space-y-2">
        <Label
          htmlFor="status-select"
          className="text-xs text-muted-foreground"
        >
          Status Order
        </Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger id="status-select" className="w-full">
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tracking Fields - shown when Shipped is selected */}
      {showTrackingFields && (
        <div className="space-y-3 rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Info Pengiriman (opsional)
          </p>
          <div className="space-y-2">
            <Label htmlFor="carrier" className="text-xs">
              Kurir
            </Label>
            <Input
              id="carrier"
              placeholder="JNE, J&T, SiCepat, dll"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-number" className="text-xs">
              Nomor Resi
            </Label>
            <Input
              id="tracking-number"
              placeholder="Masukkan nomor resi"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Cancellation Reason - shown when Cancelled is selected */}
      {showCancellationField && (
        <div className="space-y-2 rounded-lg bg-destructive/10 p-3">
          <Label htmlFor="cancellation-reason" className="text-xs">
            Alasan Pembatalan (opsional)
          </Label>
          <Textarea
            id="cancellation-reason"
            placeholder="Masukkan alasan pembatalan order"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {/* Update Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isStatusChanged || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Update Status"
        )}
      </Button>
    </div>
  );
}
