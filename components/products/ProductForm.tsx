"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetAllAttributesQuery } from "@/redux/api/attributeApi";
import MediaLibraryModal from "@/components/media/MediaLibraryModal";
import { toast } from "@/components/ui/toast";
import {
  Package,
  Layers,
  Tag,
  ImageIcon,
  Plus,
  Trash2,
  Loader2,
  Save,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import {
  IProduct,
  ICreateProductInput,
  IVariantInput,
  IBrand,
  ICategory,
  IAttribute,
  IMedia,
  IApiResponse,
} from "@/types/common";

interface ProductFormProps {
  initialData?: IProduct | null;
  onSubmit: (data: ICreateProductInput) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading = false }: ProductFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Tab 1: Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hasVariants, setHasVariants] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [sku, setSku] = useState<string>("");

  // Tab 2: Brand & Categories
  const [brandId, setBrandId] = useState<string>("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Tab 3: Media
  const [selectedMedia, setSelectedMedia] = useState<IMedia[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Tab 4: Variants State
  const [variantsList, setVariantsList] = useState<IVariantInput[]>([]);

  // Total steps: 3 steps for Simple Product, 4 steps for Variable Product
  const totalSteps = hasVariants ? 4 : 3;

  const [prevInitialData, setPrevInitialData] = useState(initialData);

  // Pre-fill initial product data for editing during render when initialData prop changes
  if (prevInitialData !== initialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setHasVariants(initialData.hasVariants || false);
      setPrice(initialData.price !== null && initialData.price !== undefined ? String(initialData.price) : "");
      setSalePrice(initialData.salePrice !== null && initialData.salePrice !== undefined ? String(initialData.salePrice) : "");
      setStock(initialData.stock !== null && initialData.stock !== undefined ? String(initialData.stock) : "");
      setSku(initialData.sku || "");
      setBrandId(initialData.brandId || "");

      if (initialData.categories && initialData.categories.length > 0) {
        setSelectedCategoryIds(initialData.categories.map((c) => c.categoryId));
      }

      if (initialData.media && initialData.media.length > 0) {
        setSelectedMedia(initialData.media.map((m) => m.media).filter(Boolean));
      }

      if (initialData.variants && initialData.variants.length > 0) {
        setVariantsList(
          initialData.variants.map((v) => ({
            id: v.id,
            price: v.price,
            salePrice: v.salePrice,
            stock: v.stock,
            sku: v.sku,
            attributes: v.attributes?.map((a) => ({
              attributeId: a.attributeId,
              attributeValueId: a.attributeValueId,
            })) || [],
          }))
        );
      }
    }
  }

  // Fetch Brands, Categories, Attributes
  const { data: brandsRes } = useGetAllBrandsQuery();
  const { data: categoriesRes } = useGetAllCategoriesQuery();
  const { data: attributesRes } = useGetAllAttributesQuery();

  const brandsList: IBrand[] =
    (brandsRes as IApiResponse<IBrand[]>)?.data || (brandsRes as unknown as IBrand[]) || [];

  const categoriesList: ICategory[] =
    (categoriesRes as IApiResponse<ICategory[]>)?.data || (categoriesRes as unknown as ICategory[]) || [];

  const attributesList: IAttribute[] =
    (attributesRes as IApiResponse<IAttribute[]>)?.data || (attributesRes as unknown as IAttribute[]) || [];

  const toggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds((prev) => [...prev, catId]);
    }
  };

  // Add new variant row to variant matrix
  const handleAddVariantRow = () => {
    if (attributesList.length === 0) {
      toast({
        title: "No Attributes Found",
        description: "Please create product attributes (e.g. Size, Color) first under Attributes menu.",
        type: "error",
      });
      return;
    }

    const firstAttr = attributesList[0];
    const firstValue = firstAttr.values && firstAttr.values.length > 0 ? firstAttr.values[0] : null;

    if (!firstValue) {
      toast({
        title: "Attribute Values Required",
        description: `Please add at least one option value to '${firstAttr.name}' in Attributes menu.`,
        type: "error",
      });
      return;
    }

    const defaultSku = `${name ? name.substring(0, 3).toUpperCase() : "SKU"}-${Date.now().toString().slice(-4)}`;

    setVariantsList((prev) => [
      ...prev,
      {
        price: price ? parseFloat(price) : 100,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: stock ? parseInt(stock) : 10,
        sku: defaultSku,
        attributes: [
          {
            attributeId: firstAttr.id || firstAttr._id || "",
            attributeValueId: firstValue.id || firstValue._id || "",
          },
        ],
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof IVariantInput, val: any) => {
    setVariantsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleUpdateVariantAttr = (variantIdx: number, attrIdx: number, field: "attributeId" | "attributeValueId", val: string) => {
    setVariantsList((prev) => {
      const copy = [...prev];
      const targetVariant = { ...copy[variantIdx] };
      const attrsCopy = [...targetVariant.attributes];

      if (field === "attributeId") {
        const newAttr = attributesList.find((a) => (a.id || a._id) === val);
        const firstVal = newAttr?.values && newAttr.values.length > 0 ? newAttr.values[0] : null;
        attrsCopy[attrIdx] = {
          attributeId: val,
          attributeValueId: firstVal ? firstVal.id || firstVal._id || "" : "",
        };
      } else {
        attrsCopy[attrIdx] = { ...attrsCopy[attrIdx], attributeValueId: val };
      }

      targetVariant.attributes = attrsCopy;
      copy[variantIdx] = targetVariant;
      return copy;
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariantsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Step-by-step validation before proceeding to next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        toast({ title: "Validation Error", description: "Product name is required.", type: "error" });
        return;
      }
      if (!hasVariants) {
        if (!price || parseFloat(price) <= 0) {
          toast({ title: "Validation Error", description: "Simple product must have a valid price.", type: "error" });
          return;
        }
        if (!stock || parseInt(stock) < 0) {
          toast({ title: "Validation Error", description: "Simple product stock cannot be negative.", type: "error" });
          return;
        }
        if (!sku.trim()) {
          toast({ title: "Validation Error", description: "Simple product must have a SKU code.", type: "error" });
          return;
        }
      }
    }

    if (currentStep === 2) {
      if (selectedCategoryIds.length === 0) {
        toast({ title: "Validation Error", description: "Please select at least one category.", type: "error" });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Product name is required.", type: "error" });
      setCurrentStep(1);
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast({ title: "Validation Error", description: "Please select at least one category.", type: "error" });
      setCurrentStep(2);
      return;
    }

    if (hasVariants && variantsList.length === 0) {
      toast({ title: "Validation Error", description: "Variable product must have at least one variant.", type: "error" });
      setCurrentStep(4);
      return;
    }

    const payload: ICreateProductInput = {
      name: name.trim(),
      description: description.trim() || null,
      hasVariants,
      brandId: brandId && brandId !== "none" ? brandId : null,
      categoryIds: selectedCategoryIds,
      mediaIds: selectedMedia.map((m) => m.id || m._id || "").filter(Boolean),
      price: !hasVariants && price ? parseFloat(price) : null,
      salePrice: !hasVariants && salePrice ? parseFloat(salePrice) : null,
      stock: !hasVariants && stock ? parseInt(stock) : null,
      sku: !hasVariants && sku.trim() ? sku.trim() : null,
      variants: hasVariants
        ? variantsList.map((v) => ({
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : null,
            stock: Number(v.stock),
            sku: v.sku,
            attributes: v.attributes,
          }))
        : undefined,
    };

    await onSubmit(payload);
  };

  // Progress percentage calculation
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      {/* Product Name Header & Animated Unique Progress Bar */}
      <div className="p-5 rounded-2xl border border-border bg-card/80 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>{name ? name : "New Product Creation"}</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Step {currentStep} of {totalSteps}: {
                currentStep === 1 ? "Basic Info & Pricing" :
                currentStep === 2 ? "Brand & Categories" :
                currentStep === 3 ? "Media Attachments" : "Variants Matrix Grid"
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400">{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Unique Animated Gradient Progress Bar */}
        <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-indigo-500/20">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Wizard Navigation Header */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-card overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            currentStep === 1
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Step 1. Basic Info & Pricing</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            currentStep === 2
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Step 2. Brand & Categories ({selectedCategoryIds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            currentStep === 3
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Step 3. Media Gallery ({selectedMedia.length})</span>
        </button>

        {hasVariants && (
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              currentStep === 4
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Step 4. Variants Matrix ({variantsList.length})</span>
          </button>
        )}
      </div>

      {/* Step 1: Basic Info & Pricing */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              General Product Information
            </CardTitle>
            <CardDescription>Enter main product title, descriptions, and pricing structure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-sm">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g. MacBook Pro 16, iPhone 17 Pro Max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-sm">Description</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Detailed product descriptions, features, and specs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Simple vs Variable Toggle Switch */}
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
              <div>
                <Label htmlFor="hasVariants" className="font-bold text-sm text-foreground block">
                  Product Type: {hasVariants ? "Variable Product (Multiple Options)" : "Simple Product (Single Item)"}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enable variable product to configure variant pricing/stock (e.g. 256GB / 512GB).
                </p>
              </div>
              <Switch
                id="hasVariants"
                checked={hasVariants}
                onCheckedChange={(val) => {
                  setHasVariants(val);
                }}
              />
            </div>

            {/* Simple Product Pricing Fields */}
            {!hasVariants ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-semibold text-xs">Regular Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salePrice" className="font-semibold text-xs">Sale Price ($)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    placeholder="89.99"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="font-semibold text-xs">Stock Units *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="font-semibold text-xs">SKU Code *</Label>
                  <Input
                    id="sku"
                    placeholder="PROD-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-card/60 text-center space-y-2">
                <Layers className="w-6 h-6 mx-auto text-indigo-400" />
                <p className="text-xs font-semibold text-foreground">
                  Variable Product Enabled (4 Steps Total)
                </p>
                <p className="text-xs text-muted-foreground">
                  Individual price, stock, and SKU for each variant will be configured under <span className="text-indigo-400 font-bold">Step 4: Variants Matrix</span>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Brand & Categories */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-500" />
              Brand & Category Assignment
            </CardTitle>
            <CardDescription>Select manufacturer brand and assign product category classifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="brandSelect" className="font-semibold text-sm">Select Brand (Optional)</Label>
              <select
                id="brandSelect"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">No Brand (Generic Product)</option>
                {brandsList.map((b) => (
                  <option key={b.id || b._id} value={b.id || b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-sm block">Categories * (Select at least one)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {categoriesList.map((cat) => {
                  const catId = cat.id || cat._id || "";
                  const isChecked = selectedCategoryIds.includes(catId);

                  return (
                    <div
                      key={catId}
                      onClick={() => toggleCategory(catId)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? "border-indigo-500 bg-indigo-500/10 font-semibold"
                          : "border-border hover:border-indigo-500/40"
                      }`}
                    >
                      <span className="text-xs text-foreground capitalize">{cat.name}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Media Gallery */}
      {currentStep === 3 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                Product Media Attachments
              </CardTitle>
              <CardDescription>Select product showcase images from system Media Library.</CardDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMediaModalOpen(true)}
              className="gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Open Media Library
            </Button>
          </CardHeader>
          <CardContent>
            {selectedMedia.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/40 space-y-3">
                <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No media images attached yet.</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsMediaModalOpen(true)}>
                  Attach Images from Media Library
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {selectedMedia.map((m) => (
                  <div key={m.id || m._id} className="group relative aspect-square rounded-xl border border-border overflow-hidden bg-slate-950/40">
                    <Image src={m.thumbnailUrl || m.url} alt={m.name || "Media"} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => setSelectedMedia((prev) => prev.filter((item) => (item.id || item._id) !== (m.id || m._id)))}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Variants Matrix (When Variable Product Enabled) */}
      {currentStep === 4 && hasVariants && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Product Variants Matrix Grid
              </CardTitle>
              <CardDescription>Define variant combinations with individual pricing, stock, and SKU codes.</CardDescription>
            </div>

            <Button type="button" variant="default" size="sm" onClick={handleAddVariantRow} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Add Variant Option
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {variantsList.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/40 space-y-3">
                <Layers className="w-10 h-10 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No variant combinations added.</p>
                <Button type="button" size="sm" onClick={handleAddVariantRow} className="gap-2">
                  <Plus className="w-4 h-4" /> Add First Variant
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {variantsList.map((variant, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-xs text-indigo-400">Variant #{idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRemoveVariantRow(idx)}
                        className="text-destructive hover:text-destructive text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-[11px] font-semibold">Attribute Option</Label>
                        <div className="flex items-center gap-2">
                          <select
                            value={variant.attributes[0]?.attributeId || ""}
                            onChange={(e) => handleUpdateVariantAttr(idx, 0, "attributeId", e.target.value)}
                            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
                          >
                            {attributesList.map((a) => (
                              <option key={a.id || a._id} value={a.id || a._id}>
                                {a.name}
                              </option>
                            ))}
                          </select>

                          <select
                            value={variant.attributes[0]?.attributeValueId || ""}
                            onChange={(e) => handleUpdateVariantAttr(idx, 0, "attributeValueId", e.target.value)}
                            className="h-8 px-2 rounded-md border border-input bg-background text-xs flex-1"
                          >
                            {attributesList
                              .find((a) => (a.id || a._id) === variant.attributes[0]?.attributeId)
                              ?.values?.map((v) => (
                                <option key={v.id || v._id} value={v.id || v._id}>
                                  {v.value}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Price ($) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => handleUpdateVariant(idx, "price", parseFloat(e.target.value))}
                          className="h-8 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Stock *</Label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleUpdateVariant(idx, "stock", parseInt(e.target.value))}
                          className="h-8 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">SKU *</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                          className="h-8 text-xs font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step Wizard Action Controls Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handlePrevStep} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Button>
        )}

        {currentStep < totalSteps ? (
          <Button type="button" onClick={handleNextStep} className="gap-2 px-6">
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading} className="gap-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{initialData ? "Update Product" : "Save & Publish Product"}</span>
          </Button>
        )}
      </div>

      <MediaLibraryModal
        open={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        multiple={true}
        selectedIds={selectedMedia.map((m) => m.id || m._id || "")}
        onSelect={(items) => setSelectedMedia(items)}
      />
    </form>
  );
}

export default ProductForm;
