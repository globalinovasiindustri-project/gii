import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { InferSelectModel } from "drizzle-orm";
import { orders, orderItems, products } from "@/lib/db/schema";
import { toast } from "sonner";
import type { UpdateOrderStatusSchema } from "@/lib/validations/order.validation";

// Type definitions
export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type Product = InferSelectModel<typeof products>;

export interface CompleteOrder {
  order: Order;
  orderItems: Array<{
    orderItem: OrderItem;
    product: Product | null;
  }>;
}

export interface OrderFilters {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
}

export interface OrderFiltersWithPagination extends OrderFilters {
  page: number;
  pageSize: number;
}

// Response types
interface OrderListResponse {
  success: boolean;
  message: string;
  data: CompleteOrder[];
  hasMore?: boolean;
}

interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: CompleteOrder | null;
}

// User order types (for /user/orders page)
export interface UserOrderItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string | null;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: string;
  customerNotes: string | null;
  createdAt: string;
  orderItems: UserOrderItem[];
}

interface UserOrdersResponse {
  success: boolean;
  message: string;
  data: UserOrder[];
}

// User orders API (for authenticated users viewing their own orders)
const userOrderApi = {
  getMyOrders: async (): Promise<UserOrdersResponse> => {
    const response = await fetch("/api/orders/my-orders", {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal memuat pesanan");
    }

    return response.json();
  },
};

// Admin API functions
const orderApi = {
  // Get all orders with filters
  getOrders: async (
    filters: OrderFiltersWithPagination
  ): Promise<OrderListResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/admin/orders?${params}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load orders");
    }

    return response.json();
  },

  // Get single order by ID
  getOrderById: async (id: string): Promise<OrderDetailResponse> => {
    const response = await fetch(`/api/admin/orders/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load order");
    }

    return response.json();
  },

  // Update order status
  updateStatus: async (
    id: string,
    data: UpdateOrderStatusSchema
  ): Promise<OrderDetailResponse> => {
    const response = await fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal mengupdate status order");
    }

    return response.json();
  },

  // Update admin notes
  updateAdminNotes: async (
    id: string,
    adminNotes: string
  ): Promise<OrderDetailResponse> => {
    const response = await fetch(`/api/admin/orders/${id}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ adminNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal menyimpan catatan admin");
    }

    return response.json();
  },
};

// Infinite scroll hook
export function useInfiniteOrders(
  filters: OrderFilters,
  pageSize: number = 20
) {
  return useInfiniteQuery({
    queryKey: ["orders", "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      orderApi.getOrders({ ...filters, page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If we got less than pageSize, there's no more data
      if (lastPage.data.length < pageSize) return undefined;
      return allPages.length + 1;
    },
    staleTime: 5 * 60 * 1000,
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to load orders");
      },
    },
  });
}

// Legacy hook for backward compatibility
export function useOrders(filters: OrderFiltersWithPagination) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => orderApi.getOrders(filters),
    staleTime: 5 * 60 * 1000,
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to load orders");
      },
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderApi.getOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    meta: {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to load order");
      },
    },
  });
}

// Mutation hook for updating order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdateOrderStatusSchema }) =>
      orderApi.updateStatus(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status order berhasil diupdate");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate status order");
    },
  });
}

// Mutation hook for updating admin notes
export function useUpdateAdminNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; adminNotes: string }) =>
      orderApi.updateAdminNotes(params.id, params.adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Catatan admin berhasil disimpan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan catatan admin");
    },
  });
}

// Hook for fetching current user's orders
export function useMyOrders(enabled: boolean = true) {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: userOrderApi.getMyOrders,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
