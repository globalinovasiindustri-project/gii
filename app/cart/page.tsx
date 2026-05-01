"use client";

import { useMemo } from "react";
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
} from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useRelatedProducts } from "@/hooks/use-products";
import { CartItem } from "@/components/cart/cart-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { CartPageSkeleton } from "@/components/cart/cart-page-skeleton";
import { EmptyCart } from "@/components/cart/empty-cart";
import { MainNavigation } from "@/components/common/main-navigation";
import { ProductCarouselSection } from "@/components/product-carousel-section";

export default function CartPage() {
  const { me } = useAuth();
  const isAuthenticated = !!me?.data?.id;

  const cartQuery = useCart();
  const items = cartQuery.data?.data?.items || [];

  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveFromCart();

  // Fetch related products for the carousel
  const relatedProductsQuery = useRelatedProducts(8);
  const relatedProducts = relatedProductsQuery.data?.data || [];

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const hasItems = items.length > 0;

  const updateQuantity = (itemId: string, quantity: number) => {
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  // Guard clause: Loading state
  if (cartQuery.isLoading) {
    return (
      <>
        <MainNavigation />
        <CartPageSkeleton />
      </>
    );
  }

  // Guard clause: Empty cart
  if (items.length === 0) {
    return (
      <>
        <MainNavigation />
        <EmptyCart />
        <ProductCarouselSection title="Lihat juga" products={relatedProducts} />
      </>
    );
  }

  // Happy path: Filled cart
  return (
    <>
      <MainNavigation />
      <div className="mx-auto py-6 md:py-12 max-w-8xl px-5 lg:px-12">
        {/* Page title */}
        <div className="flex flex-col mb-6 md:mb-12 w-full gap-1 md:gap-3">
          <h1 className="font-semibold tracking-tighter text-3xl md:text-5xl">
            Keranjang
          </h1>
          <p className="text-sm md:text-base tracking-tight font-light text-muted-foreground">
            Check out sekarang untuk membuatnya menjadi milikmu.
          </p>
        </div>

        {/* Cart UI */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-16">
          {/* Left Column - Cart Items List */}
          <div className="lg:col-span-4">
            {/* Cart Items */}
            <div className=" divide-y">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  variant="page"
                  selectable={false}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <OrderSummary
              totalItems={totalItems}
              totalPrice={totalPrice}
              hasItems={hasItems}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      {/* Related Products Carousel */}
      <ProductCarouselSection title="Lihat juga" products={relatedProducts} />
    </>
  );
}
