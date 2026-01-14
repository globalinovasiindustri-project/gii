"use client";

import { useState, useCallback } from "react";
import { Download } from "lucide-react";
import { OrderFilters } from "./_components/order-filters";
import { OrderGrid } from "./_components/order-grid";
import { OrderSheet } from "./_components/order-sheet";
import { Button } from "@/components/ui/button";
import {
  useInfiniteOrders,
  useUpdateOrderStatus,
  useUpdateAdminNotes,
  useExportOrders,
  CompleteOrder,
  OrderFilters as OrderFiltersType,
} from "@/hooks/use-orders";
import type { UpdateOrderStatusSchema } from "@/lib/validations/order.validation";

const PAGE_SIZE = 20;

export default function OrdersPage() {
  // State management for filters
  const [filters, setFilters] = useState<OrderFiltersType>({
    search: "",
    orderStatus: "all",
    paymentStatus: "all",
  });

  // State management for selected order and sheet
  const [selectedOrder, setSelectedOrder] = useState<CompleteOrder | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch orders using infinite query
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteOrders(filters, PAGE_SIZE);

  // Mutation hooks for status and notes updates
  const updateStatusMutation = useUpdateOrderStatus();
  const updateNotesMutation = useUpdateAdminNotes();
  const exportMutation = useExportOrders();

  // Flatten pages into single array
  const orders = data?.pages.flatMap((page) => page.data) ?? [];

  // Filter change handlers
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleOrderStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, orderStatus: value }));
  };

  const handlePaymentStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, paymentStatus: value }));
  };

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Card click handler - opens sheet with selected order
  const handleCardClick = (order: CompleteOrder) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  // Sheet close handler - resets selected order
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedOrder(null);
  };

  // Status update handler
  const handleStatusUpdate = (data: UpdateOrderStatusSchema) => {
    if (!selectedOrder) return;
    updateStatusMutation.mutate(
      { id: selectedOrder.order.id, data },
      {
        onSuccess: (response) => {
          // Update the selected order with new data
          if (response.data) {
            setSelectedOrder(response.data);
          }
        },
      }
    );
  };

  // Admin notes update handler
  const handleAdminNotesUpdate = (notes: string) => {
    if (!selectedOrder) return;
    updateNotesMutation.mutate(
      { id: selectedOrder.order.id, adminNotes: notes },
      {
        onSuccess: (response) => {
          // Update the selected order with new data
          if (response.data) {
            setSelectedOrder(response.data);
          }
        },
      }
    );
  };

  // Export handler
  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  return (
    <div className="container mx-auto py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Order</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4" />
          {exportMutation.isPending ? "Mengekspor..." : "Export CSV"}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error loading orders. Please try again.
          </p>
        </div>
      )}

      {/* Order Filters */}
      <OrderFilters
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        orderStatusFilter={filters.orderStatus || "all"}
        onOrderStatusFilterChange={handleOrderStatusFilterChange}
        paymentStatusFilter={filters.paymentStatus || "all"}
        onPaymentStatusFilterChange={handlePaymentStatusFilterChange}
      />

      {/* Order Grid */}
      <OrderGrid
        orders={orders}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage ?? false}
        onLoadMore={handleLoadMore}
        onCardClick={handleCardClick}
      />

      {/* Order Sheet */}
      <OrderSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        selectedOrder={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
        isUpdatingStatus={updateStatusMutation.isPending}
        onAdminNotesUpdate={handleAdminNotesUpdate}
        isUpdatingNotes={updateNotesMutation.isPending}
      />
    </div>
  );
}
