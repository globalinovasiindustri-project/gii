"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "@/components/cart-drawer";
import { UserMenu } from "@/components/common/user-menu";
import { useCart } from "@/hooks/use-cart";

export function MainNavigation() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Track if component is mounted on client (Requirement 9.3, 9.5)
  const [isMounted, setIsMounted] = useState(false);

  const cartQuery = useCart();
  const items = cartQuery.data?.data?.items || [];

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Set mounted flag on client (Requirement 9.3, 9.5)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="sticky w-full z-50 top-0 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-foreground-200 px-4 h-[64px] md:h-[80px] md:px-8">
      {/* Left: Logo + Menu */}
      <div className="flex items-center space-x-12">
        <Link href="/">
          <Image src="/logo.png" width={100} height={40} alt="logo" />
        </Link>

        <ul className="hidden items-center space-x-10 md:flex">
          <li>
            <Link href="/shop" className="hover:text-primary" prefetch={true}>
              Smartphone
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-primary">
              Elektronik
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-primary">
              Komputer
            </Link>
          </li>
        </ul>
      </div>

      {/* Right: User + Cart */}
      <div className="flex items-center gap-1">
        <UserMenu />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Shopping Cart"
          onClick={() => setIsCartOpen(true)}
          className="relative"
        >
          <ShoppingCart className="size-5" strokeWidth={1.5} />
          {/* Only show badge after hydration (Requirement 9.5) */}
          {isMounted && totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-[10px] font-semibold transition-all duration-200 ease-in-out"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          )}
        </Button>
        <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
      </div>
    </nav>
  );
}
