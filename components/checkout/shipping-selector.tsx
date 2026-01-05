"use client";

import { Loader2, Truck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShippingOption } from "@/hooks/use-shipping";

type ShippingSelectorProps = {
  options: ShippingOption[];
  selectedOption: ShippingOption | null;
  onSelect: (option: ShippingOption) => void;
  isLoading: boolean;
  error?: string;
  disabled?: boolean;
};

/**
 * Compact shipping selector using dropdown
 * Displays courier, service, cost, and ETD in a space-efficient format
 */
export function ShippingSelector({
  options,
  selectedOption,
  onSelect,
  isLoading,
  error,
  disabled = false,
}: ShippingSelectorProps) {
  const getOptionKey = (option: ShippingOption) =>
    `${option.courierId}-${option.serviceCode}`;

  const handleValueChange = (value: string) => {
    const option = options.find((opt) => getOptionKey(opt) === value);
    if (option) {
      onSelect(option);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Menghitung ongkos kirim...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (options.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Truck className="h-4 w-4" />
        <span>Lengkapi alamat untuk melihat opsi pengiriman</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedOption ? getOptionKey(selectedOption) : undefined}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih metode pengiriman">
          {selectedOption && (
            <div className="flex items-center justify-between w-full pr-2">
              <span className="font-medium">
                {selectedOption.courierName} - {selectedOption.serviceCode}
              </span>
              <span className="text-muted-foreground">
                Rp{selectedOption.cost.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const optionKey = getOptionKey(option);
          return (
            <SelectItem key={optionKey} value={optionKey}>
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {option.courierName} - {option.serviceCode}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.serviceName} • {option.etd}
                  </span>
                </div>
                <span className="font-semibold whitespace-nowrap">
                  Rp{option.cost.toLocaleString("id-ID")}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
