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
          <SelectValue placeholder="Filter by order status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Orders</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={paymentStatusFilter}
        onValueChange={onPaymentStatusFilterChange}
      >
        <SelectTrigger className="max-w-[240px]">
          <SelectValue placeholder="Filter by payment status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="pending">Unpaid</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
