"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { OrderCard } from "./_components/order-card";
import { OrdersEmptyState } from "./_components/orders-empty-state";
import { OrdersErrorState } from "./_components/orders-error-state";
import { OrdersSkeleton } from "./_components/orders-skeleton";
import Script from "next/script";

function OrdersContent() {
  const { me } = useAuth();
  const searchParams = useSearchParams();
  const highlightOrderId = searchParams.get("orderId");

  const {
    data: ordersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyOrders(!!me?.data?.id);

  // Loading state (Requirement 2.5)
  if (isLoading) {
    return <OrdersSkeleton />;
  }

  // Error state (Requirement 2.6)
  if (isError) {
    return (
      <OrdersErrorState
        message={error?.message || "Terjadi kesalahan saat memuat pesanan"}
        onRetry={() => refetch()}
      />
    );
  }

  const orders = ordersResponse?.data || [];

  // Empty state (Requirement 2.4)
  if (orders.length === 0) {
    return <OrdersEmptyState />;
  }

  // Orders list (Requirement 2.1)
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-2xl font-medium tracking-tight mb-6">Pesanan Saya</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isHighlighted={order.id === highlightOrderId}
          />
        ))}
      </div>
    </div>
  );
}

// Container page with Suspense for useSearchParams
export default function OrdersPage() {
  return (
    <>
      {/* Load Snap.js for payment popup */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </>
  );
}
