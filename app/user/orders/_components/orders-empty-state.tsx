"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Empty state component (Requirement 2.4)
export function OrdersEmptyState() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-2xl font-medium tracking-tight mb-6">Pesanan Saya</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              Anda belum memiliki pesanan
            </p>
            <p className="text-muted-foreground text-sm mt-2 mb-6">
              Pesanan Anda akan muncul di sini setelah checkout
            </p>
            <Button asChild>
              <Link href="/shop">Mulai Belanja</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
