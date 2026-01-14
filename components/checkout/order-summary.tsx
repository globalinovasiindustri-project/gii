import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  finalTotal: number;
  itemCount: number;
  isLoading?: boolean;
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
}

export function OrderSummary({
  subtotal,
  taxAmount,
  shippingCost,
  finalTotal,
  itemCount,
  isLoading = false,
  onCheckout,
  showCheckoutButton = true,
}: OrderSummaryProps) {
  return (
    <div className="sticky top-20 bg-muted rounded-2xl p-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-xl tracking-tight font-medium">
          Ringkasan belanja
        </h2>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between">
            <p className="text-sm text-gray-600">{itemCount} item dipilih</p>
          </div>

          <div className="flex flex-row justify-between">
            <p>Subtotal</p>
            <p className="font-semibold">
              Rp {subtotal.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex flex-row justify-between">
            <p>Pajak (PPN 11%)</p>
            <p className="font-semibold">
              Rp {taxAmount.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex flex-row justify-between">
            <p>Ongkos kirim</p>
            <p className="font-semibold">
              Rp {shippingCost.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex flex-row justify-between border-t pt-2 mt-2">
            <p className="font-semibold">Total</p>
            <p className="font-bold text-lg">
              Rp {finalTotal.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {showCheckoutButton && (
          <Button
            className="flex-1 text-lg font-medium"
            onClick={onCheckout}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : `Bayar Sekarang`}
          </Button>
        )}
      </div>
    </div>
  );
}
