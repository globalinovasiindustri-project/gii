"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  orderStatusFilter: string;
  onOrderStatusFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
}

export function OrderFilters({
  searchValue,
  onSearchChange,
  orderStatusFilter,
  onOrderStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
}: OrderFiltersProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <InputGroup>
        <InputGroupInput
          placeholder="Cari berdasarkan nomor pesanan atau nama pelanggan..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full"
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <Select
        value={orderStatusFilter}
        onValueChange={onOrderStatusFilterChange}
      >
        <SelectTrigger className="max-w-[240px]">
          <SelectValue placeholder="Filter status order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Order</SelectItem>
          <SelectItem value="pending">Menunggu</SelectItem>
          <SelectItem value="processing">Diproses</SelectItem>
          <SelectItem value="shipped">Dikirim</SelectItem>
          <SelectItem value="delivered">Selesai</SelectItem>
          <SelectItem value="cancelled">Dibatalkan</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={paymentStatusFilter}
        onValueChange={onPaymentStatusFilterChange}
      >
        <SelectTrigger className="max-w-[240px]">
          <SelectValue placeholder="Filter status pembayaran" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Pembayaran</SelectItem>
          <SelectItem value="unpaid">Belum Dibayar</SelectItem>
          <SelectItem value="paid">Lunas</SelectItem>
          <SelectItem value="failed">Gagal</SelectItem>
          <SelectItem value="refunded">Dikembalikan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
