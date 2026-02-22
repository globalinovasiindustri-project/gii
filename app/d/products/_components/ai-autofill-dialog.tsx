"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader, ArrowRight } from "lucide-react";
import { SelectableImage } from "./selectable-image";

interface AIAutofillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: AIGeneratedData) => void;
}

export interface AIGeneratedData {
  name: string;
  category: string;
  brand: string;
  weight: number;
  description: string;
  selectedImages: string[];
  availableImages: string[];
}

export function AIAutofillDialog({
  isOpen,
  onClose,
  onApply,
}: AIAutofillDialogProps) {
  const [step, setStep] = useState<"input" | "result">("input");
  const [productName, setProductName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedData, setGeneratedData] = useState<AIGeneratedData>({
    name: "",
    category: "",
    brand: "",
    weight: 0,
    description: "",
    selectedImages: [],
    availableImages: [],
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productName }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to generate product data");
      }

      setGeneratedData({
        name: result.data.name || productName,
        category: result.data.category || "smartphones",
        brand: result.data.brand || "other",
        weight: result.data.weight || 0,
        description: result.data.description || "",
        selectedImages: [],
        availableImages: result.data.images || [],
      });

      setIsGenerating(false);
      setStep("result");
    } catch (error) {
      console.error("Generation error:", error);
      setIsGenerating(false);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghasilkan data produk",
      );
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setGeneratedData((prev) => ({
      ...prev,
      selectedImages: prev.selectedImages.includes(imageUrl)
        ? prev.selectedImages.filter((url) => url !== imageUrl)
        : [...prev.selectedImages, imageUrl],
    }));
  };

  const handleApply = () => {
    onApply(generatedData);
    handleClose();
  };

  const handleClose = () => {
    setStep("input");
    setProductName("");
    setGeneratedData({
      name: "",
      category: "",
      brand: "",
      weight: 0,
      description: "",
      selectedImages: [],
      availableImages: [],
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto transition-all ${
          step === "input" ? "max-w-md" : "max-w-3xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Isi Otomatis dengan AI
          </DialogTitle>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ai-product-name">Nama Barang</Label>
              <Input
                id="ai-product-name"
                placeholder="Contoh: iPhone 15 Pro Max"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                Masukkan nama produk yang ingin Anda buat
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!productName.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader className="size-4 animate-[spin_0.8s_linear_infinite]" />
                    Menghasilkan...
                  </>
                ) : (
                  <>
                    Selanjutnya
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="mt-3 space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs">Nama Produk</p>
                  <p className="font-medium">{generatedData.name}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Kategori</p>
                    <p className="font-medium">
                      {generatedData.category === "smartphones"
                        ? "Smartphones"
                        : generatedData.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Merk</p>
                    <p className="font-medium">
                      {generatedData.brand === "apple"
                        ? "Apple"
                        : generatedData.brand}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Berat</p>
                    <p className="font-medium">{generatedData.weight}g</p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">
                    Deskripsi
                  </p>
                  <p className="line-clamp-3 leading-relaxed">
                    {generatedData.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-muted-foreground text-xs">
                Pilih Gambar Produk
              </h3>
              {generatedData.availableImages.length > 0 ? (
                <div className="grid grid-cols-6 gap-2">
                  {generatedData.availableImages.map(
                    (imageUrl: string, index: number) => (
                      <SelectableImage
                        key={index}
                        imageUrl={imageUrl}
                        alt={`Product ${index + 1}`}
                        isSelected={generatedData.selectedImages.includes(
                          imageUrl,
                        )}
                        onToggle={() => toggleImageSelection(imageUrl)}
                      />
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada gambar tersedia
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("input")}>
                Kembali
              </Button>
              <Button onClick={handleApply}>Terapkan</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
