import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MultiUploader } from "@/components/ui/multi-uploader";

import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Plus, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validations/product.validation";
import type { ProductSchema } from "@/lib/validations/product.validation";
import { CompleteProduct } from "@/hooks/use-products";

// Import enums
import { VARIANT_TYPES, PRODUCT_CATEGORIES, PRODUCT_BRANDS } from "@/lib/enums";
import type { ProductCategory, ProductBrand, VariantType } from "@/lib/enums";

// Helper function to get variant label from value
const getVariantLabel = (variantValue: VariantType): string => {
  const variant = Object.values(VARIANT_TYPES).find(
    (v) => v.value === variantValue
  );
  return variant?.label || variantValue;
};

interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductSchema) => void;
  selectedProduct: CompleteProduct | null;
  mode: "create" | "edit";
  isSubmitting: boolean;
}

// ProductForm Component - UI Only
function ProductForm({
  onClose,
  onSave,
  selectedProduct,
  mode,
  isSubmitting,
}: {
  onClose: () => void;
  onSave: (data: ProductSchema) => void;
  selectedProduct: CompleteProduct | null;
  mode: "create" | "edit";
  isSubmitting: boolean;
}) {
  const [selectedVariants, setSelectedVariants] = useState<VariantType[]>([]);
  const [productCombinations, setProductCombinations] = useState<any[]>([
    {
      id: 1,
      variants: {},
      sku: "",
      name: "",
      price: "0",
      stock: "0",
      active: true,
    },
  ]);
  const [productWeight, setProductWeight] = useState<string>("");
  const [additionalDescriptions, setAdditionalDescriptions] = useState<
    Array<{ id: number; title: string; body: string }>
  >([]);
  const [productImages, setProductImages] = useState<
    Array<{ url: string; isThumbnail: boolean }>
  >([]);

  const toCombinationPayload = (c: any) => ({
    id: typeof c.id === "string" ? c.id : String(c.id),
    variants: c.variants ?? {},
    sku: c.sku ?? "",
    name: c.name || undefined,
    price: typeof c.price === "number" ? c.price : Number(c.price) || 0,
    stock: typeof c.stock === "number" ? c.stock : Number(c.stock) || 0,
    active: Boolean(c.active),
  });

  const addAdditionalDescription = () => {
    const newId = Math.max(...additionalDescriptions.map((d) => d.id), 0) + 1;
    setAdditionalDescriptions((prev) => [
      ...prev,
      { id: newId, title: "", body: "" },
    ]);
  };

  const removeAdditionalDescription = (id: number) => {
    setAdditionalDescriptions((prev) => prev.filter((d) => d.id !== id));
  };

  const updateAdditionalDescription = (
    id: number,
    field: "title" | "body",
    value: string
  ) => {
    setAdditionalDescriptions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Handler to update productImages state when images change
  const handleImagesChange = (
    imagesOrUpdater:
      | Array<{ url: string; isThumbnail: boolean }>
      | ((
          prev: Array<{ url: string; isThumbnail: boolean }>
        ) => Array<{ url: string; isThumbnail: boolean }>)
  ) => {
    setProductImages((prevImages) => {
      const newImages =
        typeof imagesOrUpdater === "function"
          ? imagesOrUpdater(prevImages)
          : imagesOrUpdater;

      console.log("=== handleImagesChange ===");
      console.log("Previous images count:", prevImages.length);
      console.log("New images count:", newImages.length);
      console.log("New images:", newImages);

      // Update form value with new images
      form.setValue("images", newImages, { shouldValidate: true });

      return newImages;
    });
  };

  const addProductCombination = () => {
    const newId = Math.max(...productCombinations.map((p) => p.id), 0) + 1;
    const newCombination = {
      id: newId,
      variants: {},
      sku: "",
      name: "",
      price: "",
      stock: "",
      active: true,
    };
    setProductCombinations((prev) => [...prev, newCombination]);
  };

  const removeProductCombination = (id: number) => {
    setProductCombinations((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCombination = (id: number, field: string, value: any) => {
    setProductCombinations((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Compute initial values based on mode
  const getInitialValues = (): ProductSchema => {
    if (mode === "edit" && selectedProduct) {
      const allowedVariantValues = Object.values(VARIANT_TYPES).map(
        (v) => v.value
      ) as VariantType[];
      const initialVariantTypes = Array.from(
        new Set(selectedProduct.variants.map((v) => v.variant))
      ).filter((v): v is VariantType =>
        (allowedVariantValues as readonly string[]).includes(v)
      );

      const initialCombinations = (selectedProduct.products ?? []).map((p) => ({
        id: p.id,
        variants:
          (selectedProduct.variantSelectionsByProductId &&
            selectedProduct.variantSelectionsByProductId[p.id]) ||
          {},
        sku: p.sku ?? "",
        name: p.name ?? "",
        price: String(p.price ?? 0),
        stock: String(p.stock ?? 0),
        active: !!p.isActive,
      }));

      const existingImages = selectedProduct.productGroup.images || [];
      const savedDescriptions =
        selectedProduct.productGroup.additionalDescriptions;
      const initialDescriptions =
        savedDescriptions && Array.isArray(savedDescriptions)
          ? savedDescriptions.map((d: any) => ({
              title: d.title,
              body: d.body,
            }))
          : [];

      return {
        id: selectedProduct.productGroup.id,
        name: selectedProduct.productGroup.name ?? "",
        category: (selectedProduct.productGroup.category ||
          "smartphones") as ProductCategory,
        brand: (selectedProduct.productGroup.brand || "apple") as ProductBrand,
        isActive: !!selectedProduct.productGroup.isActive,
        hasVariants: initialVariantTypes.length > 0,
        isHighlighted: !!selectedProduct.productGroup.isHighlighted,
        weight: selectedProduct.productGroup?.weight ?? undefined,
        description: selectedProduct.productGroup.description ?? undefined,
        variantTypes: initialVariantTypes,
        combinations: initialCombinations.map(toCombinationPayload),
        images: existingImages,
        additionalDescriptions: initialDescriptions,
      };
    }

    // Create mode defaults
    return {
      name: "",
      category: "smartphones" as ProductCategory,
      brand: "apple" as ProductBrand,
      isActive: true,
      hasVariants: false,
      isHighlighted: false,
      weight: undefined,
      description: undefined,
      variantTypes: [],
      combinations: [
        {
          id: "1",
          variants: {},
          sku: "",
          name: undefined,
          price: 0,
          stock: 0,
          active: true,
        },
      ],
      images: [],
      additionalDescriptions: [],
    };
  };

  // react-hook-form instance aligned with productSchema
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: getInitialValues(),
  });

  useEffect(() => {
    form.setValue(
      "combinations",
      productCombinations.map(toCombinationPayload)
    );
  }, [productCombinations]);

  useEffect(() => {
    // Filter out empty items before setting form value
    const validDescriptions = additionalDescriptions
      .filter((d) => d.title.trim() !== "" || d.body.trim() !== "")
      .map(({ id, ...rest }) => rest);

    form.setValue("additionalDescriptions", validDescriptions);
  }, [additionalDescriptions]);

  const onSubmit = async (data: ProductSchema) => {
    try {
      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("Form data.images:", data.images);
      console.log("productImages state:", productImages);
      console.log("Full form data:", data);

      // Additional validation: ensure at least one image is marked as thumbnail if images exist
      if (data.images && data.images.length > 0) {
        const hasThumbnail = data.images.some((img) => img.isThumbnail);
        if (!hasThumbnail) {
          toast({
            title: "Validasi Gagal",
            description:
              "Setidaknya satu gambar harus ditandai sebagai thumbnail",
            variant: "destructive",
          });
          return;
        }
      }

      // If hasVariants is disabled, only submit the first combination and clear variant data
      if (!data.hasVariants) {
        const firstCombination = productCombinations[0];
        data.combinations = [
          {
            id: String(firstCombination?.id || "1"),
            variants: {},
            sku: firstCombination?.sku || "",
            name: firstCombination?.name || undefined,
            price: Number(firstCombination?.price) || 0,
            stock: Number(firstCombination?.stock) || 0,
            active: firstCombination?.active ?? true,
          },
        ];
        data.variantTypes = [];
      }

      onSave(data);
    } catch (error) {
      // Handle any unexpected errors during submission
      toast({
        title: "Terjadi Kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal menyimpan produk",
        variant: "destructive",
      });
    }
  };

  // Prefill state variables when editing an existing product or reset when creating
  useEffect(() => {
    if (mode === "edit" && selectedProduct) {
      const allowedVariantValues = Object.values(VARIANT_TYPES).map(
        (v) => v.value
      ) as VariantType[];
      const initialVariantTypes = Array.from(
        new Set(selectedProduct.variants.map((v) => v.variant))
      ).filter((v): v is VariantType =>
        (allowedVariantValues as readonly string[]).includes(v)
      ) as VariantType[];

      const initialCombinations = (selectedProduct.products ?? []).map((p) => ({
        id: p.id,
        variants:
          (selectedProduct.variantSelectionsByProductId &&
            selectedProduct.variantSelectionsByProductId[p.id]) ||
          {},
        sku: p.sku ?? "",
        name: p.name ?? "",
        price: String(p.price ?? 0),
        stock: String(p.stock ?? 0),
        active: !!p.isActive,
      }));

      setSelectedVariants(initialVariantTypes);
      setProductCombinations(initialCombinations);
      setProductWeight(
        selectedProduct.productGroup?.weight != null
          ? String(selectedProduct.productGroup.weight)
          : ""
      );

      // Prefill additional descriptions
      const savedDescriptions =
        selectedProduct.productGroup.additionalDescriptions;
      if (savedDescriptions && Array.isArray(savedDescriptions)) {
        setAdditionalDescriptions(
          savedDescriptions.map((d: any, idx: number) => ({
            id: idx + 1,
            title: d.title,
            body: d.body,
          }))
        );
      } else {
        setAdditionalDescriptions([]);
      }

      // Load existing images from selectedProduct into productImages state
      const existingImages = selectedProduct.productGroup.images || [];
      setProductImages(existingImages);
    } else if (mode === "create") {
      // Reset form and state for create mode
      setSelectedVariants([]);
      setProductCombinations([
        {
          id: 1,
          variants: {},
          sku: "",
          name: "",
          price: "0",
          stock: "0",
          active: true,
        },
      ]);
      setProductWeight("");
      setAdditionalDescriptions([]);
      setProductImages([]);

      form.reset({
        name: "",
        category: "smartphones" as ProductCategory,
        brand: "apple" as ProductBrand,
        isActive: true,
        hasVariants: false,
        isHighlighted: false,
        weight: undefined,
        description: undefined,
        variantTypes: [],
        combinations: [
          {
            id: "1",
            variants: {},
            sku: "",
            name: undefined,
            price: 0,
            stock: 0,
            active: true,
          },
        ],
        images: [],
      });
    }
  }, [mode, selectedProduct]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex-1 p-6 overflow-y-scroll max-h-[calc(100vh-160px)]">
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">
              Terdapat kesalahan pada form. Mohon periksa kembali.
            </p>
          </div>
        )}
        <div className="space-y-8">
          {/* Basic Product Information */}
          <div className="space-y-4">
            <h3 className="tracking-tight font-medium text-muted-foreground">
              Info Produk
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk *</Label>
                <Input
                  id="name"
                  placeholder="iPhone 17 Pro Max"
                  {...form.register("name")}
                  className={form.formState.errors.name ? "border-red-500" : ""}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(v) =>
                    form.setValue("category", v as ProductCategory, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    className={
                      form.formState.errors.category ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Smartphones" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRODUCT_CATEGORIES).map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select
                  value={form.watch("brand")}
                  onValueChange={(v) =>
                    form.setValue("brand", v as ProductBrand, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    className={
                      form.formState.errors.brand ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Apple" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRODUCT_BRANDS).map((brand) => (
                      <SelectItem key={brand.value} value={brand.value}>
                        {brand.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.brand && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.brand.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight"> Berat Produk (grams)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Masukkan berat produk dalam gram"
                  value={productWeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductWeight(val);
                    form.setValue(
                      "weight",
                      val === "" ? undefined : Number(val),
                      {
                        shouldValidate: true,
                      }
                    );
                  }}
                  className={
                    form.formState.errors.weight ? "border-red-500" : ""
                  }
                />
                {form.formState.errors.weight && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.weight.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Produk</Label>
              <Textarea
                id="description"
                placeholder="Deskripsikan fitur dan spesifikasi produk..."
                rows={3}
                {...form.register("description")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Status Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan grup ini untuk dijual
                </p>
              </div>
              <Switch
                id="isActive"
                checked={!!form.watch("isActive")}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasVariants">Aktifkan Variasi</Label>
                <p className="text-sm text-muted-foreground">
                  {mode === "edit"
                    ? "Pengaturan variasi tidak dapat diubah pada mode edit"
                    : "Aktifkan variasi produk ini"}
                </p>
              </div>
              <Switch
                id="hasVariants"
                checked={!!form.watch("hasVariants")}
                onCheckedChange={(checked) => {
                  form.setValue("hasVariants", checked);
                  // Clear variants when disabled
                  if (!checked) {
                    setSelectedVariants([]);
                    form.setValue("variantTypes", []);
                    // Reset combinations to single item without variants
                    setProductCombinations((prev) => [
                      {
                        ...prev[0],
                        id: prev[0]?.id || 1,
                        variants: {},
                      },
                    ]);
                  }
                }}
                disabled={mode === "edit"}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isHighlighted">Produk Unggulan</Label>
                <p className="text-sm text-muted-foreground">
                  Tandai produk ini sebagai produk unggulan
                </p>
              </div>
              <Switch
                id="isHighlighted"
                checked={!!form.watch("isHighlighted")}
                onCheckedChange={(checked) =>
                  form.setValue("isHighlighted", checked)
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="tracking-tight font-medium text-muted-foreground">
              Gambar Produk
            </h3>
            <MultiUploader
              images={productImages}
              onImagesChange={handleImagesChange}
            />
            {form.formState.errors.images && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="size-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">
                  {form.formState.errors.images.message}
                </p>
              </div>
            )}
          </div>

          {/* Product Variants - Only show when hasVariants is enabled */}
          {form.watch("hasVariants") && (
            <div className="space-y-6 flex justify-between items-start">
              <div className="flex flex-col space-y-4">
                <h3 className="tracking-tight font-medium text-muted-foreground">
                  Opsi Varian
                </h3>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-4">
                      {Object.values(VARIANT_TYPES).map((variantType) => (
                        <div
                          key={variantType.value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`variant-${variantType.value}`}
                            checked={selectedVariants.includes(
                              variantType.value
                            )}
                            onChange={(e) => {
                              const key = variantType.value as VariantType;
                              if (e.target.checked) {
                                const next: VariantType[] = [
                                  ...selectedVariants,
                                  key,
                                ];
                                setSelectedVariants(next);
                                form.setValue("variantTypes", next, {
                                  shouldValidate: true,
                                });
                              } else {
                                const next: VariantType[] =
                                  selectedVariants.filter((v) => v !== key);
                                setSelectedVariants(next);
                                form.setValue("variantTypes", next, {
                                  shouldValidate: true,
                                });
                                // Clear variant values from all combinations when unchecked
                                setProductCombinations((prev) =>
                                  prev.map((combination) => ({
                                    ...combination,
                                    variants: Object.fromEntries(
                                      Object.entries(
                                        combination.variants
                                      ).filter(([k]) => k !== key)
                                    ),
                                  }))
                                );
                              }
                            }}
                            className="rounded border-gray-300 size-4"
                          />
                          <Label
                            htmlFor={`variant-${variantType.value}`}
                            className="capitalize cursor-pointer"
                          >
                            {variantType.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pilih variant yang akan digunakan
                    </p>
                  </div>
                </div>
              </div>

              <Button type="button" onClick={addProductCombination} size="sm">
                <Plus className="w-5 h-5" />
                Tambah Varian
              </Button>
            </div>
          )}

          {/* Product Combinations */}
          <div>
            {/* Add Product Button */}
            <div className="flex justify-center"></div>

            {/* Product combination items */}
            <div className="space-y-4">
              {(form.watch("hasVariants")
                ? productCombinations
                : productCombinations.slice(0, 1)
              ).map((combination, index) => (
                <div
                  key={combination.id}
                  className="p-4 bg-card border rounded-lg shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {form.watch("hasVariants")
                        ? `Varian #${index + 1}`
                        : "Produk"}
                    </p>
                    <div className="flex space-x-3">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-normal text-muted-foreground">
                          Tampilkan
                        </Label>
                        <Switch
                          checked={!!combination.active}
                          onCheckedChange={(checked) =>
                            updateCombination(combination.id, "active", checked)
                          }
                        />
                      </div>
                      {form.watch("hasVariants") && mode === "create" && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            removeProductCombination(combination.id)
                          }
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>{" "}
                  </div>

                  {/* Dynamic variant fields - only show when hasVariants is enabled */}

                  <div className="flex gap-4">
                    {form.watch("hasVariants") &&
                      selectedVariants.map((variantType) => (
                        <div key={variantType} className="space-y-2 w-full">
                          <Label className="text-sm font-medium">
                            {getVariantLabel(variantType)}
                          </Label>
                          <Input
                            placeholder={`Masukkan ${getVariantLabel(variantType).toLowerCase()}`}
                            className="text-sm"
                            value={combination.variants[variantType] || ""}
                            onChange={(e) => {
                              const newVariants = {
                                ...combination.variants,
                                [variantType]: e.target.value,
                              };
                              updateCombination(
                                combination.id,
                                "variants",
                                newVariants
                              );
                            }}
                          />
                        </div>
                      ))}
                    <div className="space-y-2 w-full">
                      <Label className="text-sm font-medium">SKU</Label>
                      <Input
                        placeholder="Nomor SKU"
                        className="text-sm"
                        value={combination.sku}
                        onChange={(e) =>
                          updateCombination(
                            combination.id,
                            "sku",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 w-full">
                      <Label className="text-sm font-medium">Harga (IDR)</Label>
                      <Input
                        placeholder="15,000,000"
                        type="number"
                        className="text-sm"
                        value={combination.price}
                        onChange={(e) =>
                          updateCombination(
                            combination.id,
                            "price",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2 w-full">
                      <Label className="text-sm font-medium">Stok</Label>
                      <Input
                        placeholder="0"
                        type="number"
                        className="text-sm"
                        value={combination.stock}
                        onChange={(e) =>
                          updateCombination(
                            combination.id,
                            "stock",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Descriptions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="tracking-tight font-medium text-muted-foreground">
                  Deskripsi Tambahan
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tambahkan informasi tambahan seperti garansi, catatan
                  pengiriman, dll (opsional)
                </p>
              </div>
              <Button
                type="button"
                onClick={addAdditionalDescription}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            {additionalDescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-center mb-1">
                  Belum ada deskripsi tambahan
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                  Tambahkan informasi seperti garansi, catatan pengiriman, atau
                  spesifikasi khusus untuk memberikan detail lebih kepada
                  pelanggan
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {additionalDescriptions.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 bg-card border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        Item #{index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdditionalDescription(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`desc-title-${item.id}`}>Title</Label>
                      <Input
                        id={`desc-title-${item.id}`}
                        placeholder="Garansi Note"
                        value={item.title}
                        onChange={(e) =>
                          updateAdditionalDescription(
                            item.id,
                            "title",
                            e.target.value
                          )
                        }
                        maxLength={100}
                        className={
                          form.formState.errors.additionalDescriptions?.[index]
                            ?.title
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {form.formState.errors.additionalDescriptions?.[index]
                        ?.title && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.additionalDescriptions[index]
                              .title?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`desc-body-${item.id}`}>Deskripsi</Label>
                      <Textarea
                        id={`desc-body-${item.id}`}
                        placeholder="Lorem ipsum dolor sit amet"
                        value={item.body}
                        onChange={(e) =>
                          updateAdditionalDescription(
                            item.id,
                            "body",
                            e.target.value
                          )
                        }
                        rows={3}
                        maxLength={1000}
                        className={
                          form.formState.errors.additionalDescriptions?.[index]
                            ?.body
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {form.formState.errors.additionalDescriptions?.[index]
                        ?.body && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.additionalDescriptions[index]
                              .body?.message
                          }
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground text-right">
                        {item.body.length}/1000
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 p-6 border-t bg-background">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Save Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function ProductSheet({
  isOpen,
  onClose,
  onSave,
  selectedProduct,
  mode,
  isSubmitting,
}: ProductSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full max-w-2xl p-0 tracking-tight sm:max-w-3xl"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="font-normal">Buat Produk</SheetTitle>
        </SheetHeader>

        <ProductForm
          key={mode === "edit" ? selectedProduct?.productGroup.id : "create"}
          onClose={onClose}
          onSave={onSave}
          selectedProduct={selectedProduct}
          mode={mode}
          isSubmitting={isSubmitting}
        />
      </SheetContent>
    </Sheet>
  );
}
