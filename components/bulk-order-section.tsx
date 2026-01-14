"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Package, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Mock data - nanti diganti dengan data dari API
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Samsung Galaxy S24 5G",
    brand: "Samsung",
    image: "/placeholder.svg",
    variants: [
      { id: "v1", name: "Black - 128GB", price: 12000000 },
      { id: "v2", name: "Black - 256GB", price: 13500000 },
      { id: "v3", name: "White - 128GB", price: 12000000 },
      { id: "v4", name: "White - 256GB", price: 13500000 },
    ],
  },
  {
    id: "2",
    name: "iPhone 15 Pro",
    brand: "Apple",
    image: "/placeholder.svg",
    variants: [
      { id: "v5", name: "Natural Titanium - 128GB", price: 18000000 },
      { id: "v6", name: "Natural Titanium - 256GB", price: 20000000 },
      { id: "v7", name: "Blue Titanium - 128GB", price: 18000000 },
    ],
  },
  {
    id: "3",
    name: "Google Pixel 8",
    brand: "Google",
    image: "/placeholder.svg",
    variants: [
      { id: "v8", name: "Obsidian - 128GB", price: 10000000 },
      { id: "v9", name: "Hazel - 128GB", price: 10000000 },
    ],
  },
];

const QUANTITY_OPTIONS = [
  { value: "5", label: "5 pcs" },
  { value: "10", label: "10 pcs" },
  { value: "25", label: "25 pcs" },
  { value: "50", label: "50 pcs" },
  { value: "100", label: "100 pcs" },
  { value: "200", label: "200+ pcs" },
];

type BulkOrderItem = {
  id: string;
  productId: string;
  variantId: string;
  quantity: string;
};

export function BulkOrderSection() {
  const [items, setItems] = useState<BulkOrderItem[]>([
    { id: "item-1", productId: "", variantId: "", quantity: "5" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        productId: "",
        variantId: "",
        quantity: "5",
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof BulkOrderItem,
    value: string
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          // Reset variant when product changes
          if (field === "productId") {
            return { ...item, productId: value, variantId: "" };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const getProduct = (productId: string) =>
    MOCK_PRODUCTS.find((p) => p.id === productId);

  const getVariant = (productId: string, variantId: string) => {
    const product = getProduct(productId);
    return product?.variants.find((v) => v.id === variantId);
  };

  const isFormValid = items.some((item) => item.productId && item.variantId);

  const handleSubmit = () => {
    // TODO: Implement actual submission
    console.log({ items, email, name, notes });
    setIsDialogOpen(false);
    // Reset form
    setItems([{ id: "item-1", productId: "", variantId: "", quantity: "5" }]);
    setEmail("");
    setName("");
    setNotes("");
  };

  return (
    <section className="w-full px-4 md:px-8 tracking-tight">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Background Image with Text Overlay */}
        <div className="relative hidden h-[500px] overflow-hidden rounded-xl md:flex">
          <Image
            src="/bulk-order.webp?height=512&width=512"
            alt="Bulk Order Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 rounded-xl bg-black/60" />
          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Package className="size-8" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Bulk Order
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-medium leading-tight tracking-tighter md:text-4xl">
              Beli dalam jumlah banyak, untuk harga yang lebih murah.
            </h2>
            <p className="text-lg leading-relaxed text-gray-200">
              Dapatkan penawaran khusus untuk pembelian skala besar. Pilih
              produk dan variant yang kamu mau, kami akan hubungi kamu dengan
              harga terbaik.
            </p>
          </div>
        </div>

        {/* Right Column: Product Selection */}
        <div className="flex max-h-[600px] flex-col rounded-2xl bg-muted p-6 md:p-8">
          <div className="mb-6 shrink-0">
            <h3 className="text-xl font-semibold">Pilih Produk</h3>
            <p className="text-sm text-muted-foreground">
              Tambahkan produk yang ingin kamu order dalam jumlah besar
            </p>
          </div>

          {/* Product Items - Scrollable */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {items.map((item, index) => {
              const product = getProduct(item.productId);

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg bg-background p-3"
                >
                  <span className="w-6 shrink-0 text-center text-sm text-muted-foreground">
                    {index + 1}.
                  </span>

                  <Select
                    value={item.productId}
                    onValueChange={(value) =>
                      updateItem(item.id, "productId", value)
                    }
                  >
                    <SelectTrigger className="h-9 flex-1">
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PRODUCTS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.brand} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.variantId}
                    onValueChange={(value) =>
                      updateItem(item.id, "variantId", value)
                    }
                    disabled={!item.productId}
                  >
                    <SelectTrigger className="h-9 w-36">
                      <SelectValue placeholder="Variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {product?.variants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.quantity}
                    onValueChange={(value) =>
                      updateItem(item.id, "quantity", value)
                    }
                  >
                    <SelectTrigger className="h-9 w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUANTITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex shrink-0 gap-3">
            <Button
              variant="outline"
              onClick={addItem}
              className="flex-1 border-dashed"
            >
              <Plus className="size-4" />
              Tambah Produk
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              disabled={!isFormValid}
              className="flex-1 bg-black text-white hover:bg-black/90"
            >
              <Send className="size-4" />
              Minta Penawaran
            </Button>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Minta Penawaran Bulk Order</DialogTitle>
            <DialogDescription>
              Masukkan informasi kontak kamu, kami akan menghubungi dengan
              penawaran terbaik.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="rounded-lg bg-muted p-3">
              <p className="mb-2 text-sm font-medium">Ringkasan Pesanan:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {items
                  .filter((item) => item.productId && item.variantId)
                  .map((item) => {
                    const product = getProduct(item.productId);
                    const variant = getVariant(item.productId, item.variantId);
                    return (
                      <li key={item.id}>
                        • {product?.name} ({variant?.name}) - {item.quantity}{" "}
                        pcs
                      </li>
                    );
                  })}
              </ul>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Nama <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Catatan (opsional)
                </label>
                <Input
                  placeholder="Ada catatan khusus?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!email || !name}
              className="flex-1 bg-black text-white hover:bg-black/90"
            >
              Kirim Permintaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
