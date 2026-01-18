"use client";

import { useEffect, useState, useMemo } from "react";
import { X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/components/cart/cart-item";
import { CartDrawerSkeleton } from "@/components/cart/cart-drawer-skeleton";

import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
} from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  // Track if component is mounted on client (Requirement 9.3, 9.4)
  const [isMounted, setIsMounted] = useState(false);

  // Query hooks
  const cartQuery = useCart();
  const items = cartQuery.data?.data?.items || [];
  const lastSyncedAt = cartQuery.data?.data?.lastUpdated || null;

  // Mutation hooks
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveFromCart();

  // Computed values
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const hasItems = items.length > 0;

  const isLoading = cartQuery.isLoading;
  const isSyncing =
    updateQuantityMutation.isPending || removeItemMutation.isPending;

  const syncError =
    updateQuantityMutation.error?.message ||
    removeItemMutation.error?.message ||
    null;

  // Action handlers
  const updateQuantity = (itemId: string, quantity: number) => {
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const retrySync = () => {
    cartQuery.refetch();
  };

  // Set mounted flag on client (Requirement 9.3, 9.4)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedSubtotal = totalPrice.toLocaleString("id-ID");
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Note: Database sync is disabled, so no error toasts needed
  // Cart works with localStorage only

  const handleViewCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  const handleCheckout = () => {
    if (hasItems) {
      onOpenChange(false);
      router.push("/checkout");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-[480px] tracking-tight"
      >
        {/* Header */}
        <SheetHeader className="border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-xl font-medium tracking-tight">
                Keranjang Belanja
              </SheetTitle>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Tutup keranjang"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Loading State - Show during hydration or loading (Requirement 9.4, 9.5) */}
        {!isMounted || isLoading ? (
          <CartDrawerSkeleton />
        ) : (
          <>
            {/* Cart Items List */}
            <ScrollArea className="flex-1 px-4 md:px-6">
              {items.length > 0 ? (
                <div className="divide-y">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      variant="drawer"
                      selectable={false}
                      onQuantityChange={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="size-8 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-500 mb-2">
                    Keranjang Kosong
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Tambahkan produk untuk mulai berbelanja
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      router.push("/shop");
                    }}
                  >
                    Lanjut Belanja
                  </Button>
                </div>
              )}
            </ScrollArea>

            {/* Footer - Only show when there are items */}
            {items.length > 0 && (
              <div className="border-t p-4 md:p-6 bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">Subtotal</div>
                    <p className="text-xs text-muted-foreground">
                      Ongkos kirim dihitung saat checkout
                    </p>
                  </div>
                  <div className="text-xl font-medium tracking-tight">
                    Rp{formattedSubtotal}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="w-full h-11 text-base font-medium"
                    disabled={!hasItems}
                    onClick={handleCheckout}
                  >
                    Checkout ({totalItemsCount} item)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 text-base font-medium"
                    onClick={handleViewCart}
                  >
                    Lihat Keranjang
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
