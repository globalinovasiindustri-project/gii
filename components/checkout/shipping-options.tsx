"use client";

import { Loader2, Truck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ShippingOption } from "@/hooks/use-shipping";

interface ShippingOptionsProps {
  /** Available shipping options from RajaOngkir */
  options: ShippingOption[];
  /** Currently selected shipping option */
  selectedOption: ShippingOption | null;
  /** Callback when user selects a shipping option */
  onSelect: (option: ShippingOption) => void;
  /** Show loading state during calculation */
  isLoading: boolean;
  /** Error message to display */
  error?: string;
  /** Disable all options */
  disabled?: boolean;
}

/**
 * Shipping options selector component
 * Displays available shipping options with courier, service, cost, and ETD
 * Allows user to select their preferred shipping option
 */
export function ShippingOptions({
  options,
  selectedOption,
  onSelect,
  isLoading,
  error,
  disabled = false,
}: ShippingOptionsProps) {
  // Generate unique key for each option
  const getOptionKey = (option: ShippingOption) =>
    `${option.courierId}-${option.serviceCode}`;

  // Handle option selection
  const handleValueChange = (value: string) => {
    const option = options.find((opt) => getOptionKey(opt) === value);
    if (option) {
      onSelect(option);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mb-2" />
        <span className="text-sm">Menghitung ongkos kirim...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-destructive">
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  // Empty state - no options available
  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Truck className="h-6 w-6 mb-2" />
        <span className="text-sm">Tidak ada opsi pengiriman tersedia</span>
        <span className="text-xs mt-1">
          Pilih alamat lengkap untuk melihat opsi pengiriman
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RadioGroup
        value={selectedOption ? getOptionKey(selectedOption) : undefined}
        onValueChange={handleValueChange}
        disabled={disabled}
        className="gap-3"
      >
        {options.map((option) => {
          const optionKey = getOptionKey(option);
          const isSelected =
            selectedOption && getOptionKey(selectedOption) === optionKey;

          return (
            <div key={optionKey}>
              <Label
                htmlFor={optionKey}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  isSelected && "border-primary bg-accent/30",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <RadioGroupItem
                  value={optionKey}
                  id={optionKey}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {option.courierName}
                    </span>
                    <span className="font-semibold text-sm">
                      Rp{option.cost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {option.serviceCode} - {option.serviceName}
                    </span>
                    <span>{option.etd}</span>
                  </div>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
