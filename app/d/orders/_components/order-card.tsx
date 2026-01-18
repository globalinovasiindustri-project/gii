"use client";

import dayjs from "dayjs";
import {
  Package,
  HandCoins,
  Banknote,
  CircleArrowUp,
  Clock,
  Truck,
  Handshake,
  CircleX,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompleteOrder } from "@/hooks/use-orders";
import { formatCurrency, cn } from "@/lib/utils";
import {
  formatOrderStatus,
  formatPaymentStatus,
} from "@/lib/utils/status.utils";

interface OrderCardProps {
  order: CompleteOrder;
  onClick: (order: CompleteOrder) => void;
}

// Get icon dan warna untuk payment status
function getPaymentStatusIcon(status: string) {
  switch (status) {
    case "paid":
      return { icon: HandCoins, color: "text-green-500", bg: "bg-green-50" };
    case "unpaid":
      return { icon: HandCoins, color: "text-amber-500", bg: "bg-amber-50" };
    case "failed":
      return { icon: Banknote, color: "text-red-500", bg: "bg-red-50" };
    case "refunded":
      return {
        icon: CircleArrowUp,
        color: "text-muted-foreground",
        bg: "bg-muted",
      };
    default:
      return {
        icon: HandCoins,
        color: "text-muted-foreground",
        bg: "bg-muted",
      };
  }
}

// Get icon dan warna untuk order status
function getOrderStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" };
    case "processing":
      return { icon: Package, color: "text-blue-500", bg: "bg-blue-50" };
    case "shipped":
      return { icon: Truck, color: "text-blue-500", bg: "bg-blue-50" };
    case "delivered":
      return { icon: Handshake, color: "text-green-500", bg: "bg-green-50" };
    case "cancelled":
      return { icon: XCircle, color: "text-red-500", bg: "bg-red-50" };
    default:
      return { icon: Package, color: "text-muted-foreground", bg: "bg-muted" };
  }
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const { order: orderData, orderItems } = order;

  // Ambil gambar dari orderItems (max 3 untuk display)
  const productImages = orderItems
    .map((item) => ({
      url: item.orderItem.imageUrl,
      name: item.orderItem.productName,
    }))
    .slice(0, 3);

  const remainingCount = orderItems.length - 3;

  const paymentStatus = getPaymentStatusIcon(orderData.paymentStatus);
  const orderStatus = getOrderStatusIcon(orderData.orderStatus);
  const PaymentIcon = paymentStatus.icon;
  const OrderIcon = orderStatus.icon;

  return (
    <TooltipProvider>
      <Card
        className="cursor-pointer transition-all hover:shadow-md"
        onClick={() => onClick(order)}
      >
        <CardContent className="p-5 space-y-4">
          {/* Order Info: Images + Details */}
          <div className="flex w-full space-x-4">
            {/* Product Images - Overlapping, consistent dengan product-card */}
            <div className="flex -space-x-5 shrink-0">
              {productImages.map((img, index) => (
                <div
                  key={index}
                  className="size-12 rounded-lg border-2 border-white shadow-lg bg-muted overflow-hidden"
                  style={{ zIndex: productImages.length - index }}
                >
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.name}
                      className="size-full object-cover mix-blend-multiply"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center">
                      <Package className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className="size-12 rounded-2xl border-2 border-white bg-muted/80 flex items-center justify-center shadow-sm"
                  style={{ zIndex: 0 }}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="flex w-full items-center justify-between min-w-0">
              <div className="space-y-1 min-w-0">
                <p className="font-mono text-xs text-muted-foreground">
                  #{orderData.orderNumber}
                </p>
                <p className="font-medium text-sm truncate">
                  {orderData.customerName}
                </p>
              </div>
              <div className="text-right space-y-1 shrink-0">
                <p className="text-muted-foreground text-xs mb-1">Jumlah</p>
                <p className="font-medium text-sm">
                  {formatCurrency(orderData.total, orderData.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Date + Status Icons */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm">
              <p className="text-muted-foreground text-xs mb-1">
                Tanggal Order
              </p>
              <span className="font-medium">
                {orderData.createdAt
                  ? dayjs(orderData.createdAt).format("MMMM D, YYYY")
                  : "-"}
              </span>
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-2">
              {/* Order Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "size-8 rounded flex items-center justify-center",
                      orderStatus.bg
                    )}
                  >
                    <OrderIcon className={cn("size-4", orderStatus.color)} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p className="text-xs">
                    Order: {formatOrderStatus(orderData.orderStatus)}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Payment Status */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "size-8 rounded flex items-center justify-center",
                      paymentStatus.bg
                    )}
                  >
                    <PaymentIcon
                      className={cn("size-4", paymentStatus.color)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-black">
                  <p className="text-xs">
                    Pembayaran: {formatPaymentStatus(orderData.paymentStatus)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
