"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Copy, Check } from "lucide-react";
import { CompleteOrder } from "@/hooks/use-orders";
import { formatCurrency, formatAddress, cn } from "@/lib/utils";
import { formatPaymentStatus } from "@/lib/utils/status.utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import { StatusUpdateSection } from "./status-update-section";
import { AdminNotesSection } from "./admin-notes-section";
import type { UpdateOrderStatusSchema } from "@/lib/validations/order.validation";

interface OrderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: CompleteOrder | null;
  onStatusUpdate?: (data: UpdateOrderStatusSchema) => void;
  isUpdatingStatus?: boolean;
  onAdminNotesUpdate?: (notes: string) => void;
  isUpdatingNotes?: boolean;
}

// Order timeline steps
const ORDER_STEPS = [
  { key: "pending", label: "Dipesan" },
  { key: "processing", label: "Diproses" },
  { key: "shipped", label: "Dikirim" },
  { key: "delivered", label: "Selesai" },
] as const;

// Get step status
function getStepStatus(stepKey: string, orderStatus: string) {
  const stepOrder = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = stepOrder.indexOf(orderStatus);
  const stepIndex = stepOrder.indexOf(stepKey);

  if (orderStatus === "cancelled") return "cancelled";
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

// Get step date
function getStepDate(stepKey: string, order: CompleteOrder["order"]) {
  switch (stepKey) {
    case "pending":
    case "processing":
      return order.createdAt;
    case "shipped":
      return order.shippedAt;
    case "delivered":
      return order.deliveredAt;
    default:
      return null;
  }
}

export function OrderSheet({
  isOpen,
  onClose,
  selectedOrder,
  onStatusUpdate,
  isUpdatingStatus = false,
  onAdminNotesUpdate,
  isUpdatingNotes = false,
}: OrderSheetProps) {
  if (!selectedOrder) return null;

  const { order, orderItems } = selectedOrder;
  const isCancelled = order.orderStatus === "cancelled";

  // Parse shipping address
  let shippingAddress: Record<string, string> = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddress || "{}");
  } catch {
    // ignore parse error
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast.success("Order number copied!");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-0"
      >
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <SheetTitle className="text-xl font-medium">Order</SheetTitle>
              <div className="flex items-center gap-2">
                <p className="font-mono text-muted-foreground text-xs">
                  {" "}
                  #{order.orderNumber}
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-5 rounded"
                  onClick={copyOrderNumber}
                >
                  <Copy className="size-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Order Timeline - Vertical */}
          <div className="space-y-0">
            {ORDER_STEPS.map((step, index) => {
              const status = getStepStatus(step.key, order.orderStatus);
              const stepDate = getStepDate(step.key, order);
              const isLast = index === ORDER_STEPS.length - 1;

              return (
                <div key={step.key} className="flex gap-3">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "size-5 rounded-full flex items-center justify-center border-2",
                        status === "completed" && "bg-primary border-primary",
                        status === "current" && "border-primary bg-primary",
                        status === "upcoming" &&
                          "border-muted-foreground/30 bg-background",
                        status === "cancelled" &&
                          "border-destructive bg-background"
                      )}
                    >
                      {(status === "completed" || status === "current") && (
                        <Check className="size-3.5 text-primary-foreground" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 h-8",
                          status === "completed"
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        )}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div>
                    <p
                      className={cn(
                        "font-medium text-sm",
                        status === "upcoming" && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {stepDate ? (
                      <p className="text-xs text-muted-foreground">
                        {dayjs(stepDate).format("h:mm A, MMMM D, YYYY")}
                      </p>
                    ) : status === "current" ? (
                      <p className="text-xs text-muted-foreground">
                        In progress...
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {/* Cancelled state */}
            {isCancelled && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-5 rounded-full flex items-center justify-center border-2 border-destructive bg-destructive">
                    <span className="text-destructive-foreground text-xs font-bold">
                      ✕
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm text-destructive">
                    Cancelled
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order has been cancelled
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary - Muted background */}
          <div className="flex flex-col space-y-3">
            {" "}
            <h3 className="text-sm">Ringkasan Order</h3>
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">User:</p>
                <p className="font-medium">{order.customerName}</p>
              </div>

              {shippingAddress.phone && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs">Telepon:</p>
                  <p className="font-medium">+62 {shippingAddress.phone}</p>
                </div>
              )}

              <div className="text-sm">
                <p className="text-muted-foreground text-xs">Alamat:</p>
                <address className="not-italic font-medium leading-relaxed">
                  {formatAddress(shippingAddress)}
                </address>
              </div>

              {order.paymentMethod && (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Method:</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ordered Products */}
          <div className="space-y-1">
            <h3 className="text-sm">Daftar Pesanan</h3>

            <div className="space-y-0">
              {orderItems.map((item, index) => (
                <div key={item.orderItem.id}>
                  <div className="flex gap-4 py-3 items-center">
                    {/* Product Image */}
                    <div className="size-24 rounded-lg bg-muted/80 overflow-hidden shrink-0">
                      {item.orderItem.imageUrl ? (
                        <img
                          src={item.orderItem.imageUrl}
                          alt={item.orderItem.productName}
                          className="size-full object-cover mix-blend-multiply"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <Package className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info & Price */}

                    <div className="space-y-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium tracking-tight">
                          {item.orderItem.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.orderItem.productSku}
                        </p>
                      </div>

                      <p className="text-sm tracking-tight">
                        {item.orderItem.quantity} x{" "}
                        {formatCurrency(
                          item.orderItem.subtotal,
                          order.currency
                        )}
                      </p>
                    </div>
                  </div>
                  {index < orderItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </div>

          {/* Order Total - Ticket/Bill Style */}
          <div className="relative bg-muted rounded-xl">
            {/* Top perforated notches */}
            <div className="absolute -top-3 left-0 right-0 flex justify-between">
              <div className="size-8 bg-background rounded-full -ml-4" />
              <div className="size-8 bg-background rounded-full -mr-4" />
            </div>

            {/* Content */}
            <div className="px-5 pt-6 pb-5 space-y-3">
              {/* Total amount header */}
              <div className="text-center pb-3">
                <p className="text-xl font-medium tracking-tight">
                  {formatCurrency(order.total, order.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dayjs(order.createdAt).format("MMMM D, h:mm A")}
                </p>
              </div>

              {/* Dashed separator */}
              <div className="border-t-2 border-dashed border-muted-foreground/20" />

              {/* Breakdown */}
              <div className="space-y-2 py-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.tax, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span>
                    {formatCurrency(order.shippingCost, order.currency)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>
                      -{formatCurrency(order.discount, order.currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Dashed separator */}
              <div className="border-t-2 border-dashed border-muted-foreground/20" />

              {/* Payment status */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Status Pembayaran
                </p>
                <p className="font-medium">
                  {formatPaymentStatus(order.paymentStatus)}
                </p>
              </div>
            </div>

            {/* Bottom perforated notches */}
            <div className="absolute -bottom-3 left-0 right-0 flex justify-between">
              <div className="size-8 bg-background rounded-full -ml-4" />
              <div className="size-8 bg-background rounded-full -mr-4" />
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="rounded-xl bg-muted p-4 space-y-2">
              <h3 className="font-medium text-sm">Tracking</h3>
              <div className="text-sm">
                {order.carrier && (
                  <p className="font-medium">{order.carrier}</p>
                )}
                <p className="text-muted-foreground font-mono">
                  {order.trackingNumber}
                </p>
              </div>
            </div>
          )}

          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Catatan Customer</h3>
              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm">{order.customerNotes}</p>
              </div>
            </div>
          )}

          {/* Admin Notes Section */}
          {onAdminNotesUpdate && (
            <AdminNotesSection
              notes={order.adminNotes}
              onSave={onAdminNotesUpdate}
              isSaving={isUpdatingNotes}
            />
          )}

          {/* Status Update Section - Footer */}
          {onStatusUpdate && (
            <StatusUpdateSection
              currentStatus={order.orderStatus}
              currentTrackingNumber={order.trackingNumber}
              currentCarrier={order.carrier}
              onSubmit={onStatusUpdate}
              isSubmitting={isUpdatingStatus}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
