"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDateTime,
  formatStatus,
  getStatusVariant,
} from "@/lib/utils";
import type { UserOrder } from "@/hooks/use-orders";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

dayjs.extend(relativeTime);
dayjs.locale("id");

type OrderCardProps = {
  order: UserOrder;
  isHighlighted?: boolean;
};

// Parse shipping address JSON to readable string
function parseAddress(addressJson: string): {
  address: string;
  phone: string | null;
} {
  try {
    const addr = JSON.parse(addressJson);
    // Build address from available fields
    const parts = [
      addr.fullAddress,
      addr.village,
      addr.district,
      addr.city,
      addr.province || addr.state, // Support both field names
      addr.postalCode,
    ].filter(Boolean);
    return {
      address: parts.join(", "),
      phone: addr.phone || null,
    };
  } catch {
    return { address: addressJson, phone: null };
  }
}

export function OrderCard({ order, isHighlighted = false }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted order on mount
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [isHighlighted]);

  return (
    <Card
      ref={cardRef}
      className={isHighlighted ? "ring-2 ring-primary" : " border-none"}
    >
      <CardHeader className="pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            {/* Order number (Requirement 2.2) */}
            <CardTitle className="tracking-tight font-medium text-base">
              {order.orderNumber}
            </CardTitle>
            <div className="flex flex-wrap gap-2 justify-end">
              {/* Order status badge (Requirement 2.2) */}
              <Badge variant={getStatusVariant(order.orderStatus)}>
                {formatStatus(order.orderStatus)}
              </Badge>
              {/* Payment status badge (Requirement 2.2) */}
              <Badge variant={getStatusVariant(order.paymentStatus)}>
                {formatStatus(order.paymentStatus)}
              </Badge>
            </div>
          </div>
          {/* Order date (Requirement 2.2) */}
          <p className="text-sm text-muted-foreground mt-1">
            {formatDateTime(order.createdAt)} (
            {dayjs(order.createdAt).fromNow()})
          </p>
        </div>
      </CardHeader>

      {/* First item preview - always visible */}
      <CardContent>
        {order.orderItems.length > 0 && (
          <div className="mb-4">
            {(() => {
              const firstItem = order.orderItems[0];
              const remainingCount = order.orderItems.length - 1;
              return (
                <div className="flex items-center gap-4 mt-3">
                  <div className="size-24 rounded-lg bg-muted/80 overflow-hidden shrink-0">
                    {firstItem.imageUrl && (
                      <Image
                        src={firstItem.imageUrl}
                        alt={firstItem.productName}
                        className="size-full object-cover mix-blend-multiply"
                        width={64}
                        height={64}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium tracking-tight truncate">
                      {firstItem.productName}
                    </p>

                    <p className="text-sm tracking-tight">
                      {firstItem.quantity} x{" "}
                      {formatCurrency(firstItem.subtotal, order.currency)}
                    </p>
                    {remainingCount > 0 && (
                      <p className="text-sm text-muted-foreground tracking-tight">
                        +{remainingCount} produk lainnya
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium tracking-tight">
                      {formatCurrency(firstItem.subtotal, order.currency)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Expandable details section (Requirement 2.3) */}
        <Button
          variant="secondary"
          size="sm"
          className=""
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{isExpanded ? "Sembunyikan Detail" : "Lihat Detail"}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-4 border-t border-dashed space-y-4">
            {/* Order Items (Requirement 2.3) */}
            <div className="space-y-3 pt-4">
              <h3 className="font-medium text-sm">Daftar Pesanan</h3>
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                >
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                      width={64}
                      height={64}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.productSku}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Jumlah: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.subtotal, order.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice, order.currency)} / item
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address (Requirement 2.3) */}
            <div>
              <h3 className="font-medium text-sm mb-2">Alamat Pengiriman</h3>
              {(() => {
                const { address, phone } = parseAddress(order.shippingAddress);
                return (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {phone && <p>Telepon: +62 {phone}</p>}
                    <p>{address}</p>
                  </div>
                );
              })()}
            </div>

            {/* Customer Notes */}
            {order.customerNotes && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Catatan</h3>
                <p className="text-sm text-muted-foreground">
                  {order.customerNotes}
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span>
                    {formatCurrency(order.shippingCost, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Belanja</span>
                  <span>{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
