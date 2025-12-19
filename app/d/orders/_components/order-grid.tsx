"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CompleteOrder } from "@/hooks/use-orders";
import { OrderCard } from "./order-card";

interface OrderGridProps {
  orders: CompleteOrder[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onCardClick: (order: CompleteOrder) => void;
}

function OrderCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="text-right">
            <Skeleton className="h-3 w-12 mb-2 ml-auto" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderGrid({
  orders,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onCardClick,
}: OrderGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.order.id} order={order} onClick={onCardClick} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
