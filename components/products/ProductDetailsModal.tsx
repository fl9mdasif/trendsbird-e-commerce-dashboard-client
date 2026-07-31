"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Trash2,
  Tag,
  Layers,
  Sparkles,
  Barcode,
  CheckCircle2,
} from "lucide-react";
import { IProduct } from "@/types/common";
import { formatProductPrice, formatProductStock } from "@/app/(dashboard)/products/function.product";

interface ProductDetailsModalProps {
  product: IProduct | null;
  onClose: () => void;
  onDelete: (id: string, name: string) => void;
  canDelete: boolean;
}

export function ProductDetailsModal({
  product,
  onClose,
  onDelete,
  canDelete,
}: ProductDetailsModalProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  if (!product) return null;

  const priceInfo = formatProductPrice(product);
  const stockInfo = formatProductStock(product);
  const mediaList = product.media?.map((m) => m.media).filter(Boolean) || [];
  const currentMedia = mediaList[activeMediaIndex] || mediaList[0];

  return (
    <Dialog open={Boolean(product)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Package className="w-5 h-5 text-indigo-500" />
            <span>{product.name}</span>
            {product.hasVariants ? (
              <Badge className="bg-indigo-600/90 text-white text-xs font-semibold gap-1 ml-auto">
                <Layers className="w-3 h-3" /> Variable Product
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-semibold ml-auto">
                Simple Product
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-2 custom-scrollbar">
          {/* Top Section: Media Gallery Preview & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Media Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl bg-slate-950/60 overflow-hidden border border-border flex items-center justify-center">
                {currentMedia ? (
                  <Image
                    src={currentMedia.url}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <Package className="w-10 h-10" />
                    <span className="text-xs font-medium">No Images Attached</span>
                  </div>
                )}
              </div>

              {/* Thumbnails Strip */}
              {mediaList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {mediaList.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activeMediaIndex === idx ? "border-indigo-500 scale-95" : "border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={m.thumbnailUrl || m.url} alt="Thumb" fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & Specs */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-semibold text-xs">
                      <Sparkles className="w-3 h-3" />
                      {product.brand.name}
                    </Badge>
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-muted-foreground block">Price Range:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-foreground">{priceInfo.mainPrice}</span>
                    {priceInfo.salePrice && (
                      <span className="text-sm text-muted-foreground line-through">{priceInfo.salePrice}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block">Stock Status:</span>
                  <span className="text-sm font-semibold text-foreground">{stockInfo.text}</span>
                </div>

                {product.sku && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">SKU Code:</span>
                    <Badge variant="outline" className="font-mono text-xs gap-1">
                      <Barcode className="w-3 h-3" /> {product.sku}
                    </Badge>
                  </div>
                )}

                {product.description && (
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Description:</span>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground block">Assigned Categories:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.categories.map((c) => (
                      <Badge key={c.categoryId} variant="secondary" className="text-xs font-medium gap-1">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        {c.category?.name || "Category"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants Table Matrix if Variable Product */}
          {product.hasVariants && product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Product Variants Matrix ({product.variants.length})
              </h5>

              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="p-2.5">Variant Options</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {product.variants.map((v) => {
                      const attrSpecs = v.attributes
                        ?.map((a) => `${a.attribute?.name || "Option"}: ${a.attributeValue?.value || "Value"}`)
                        .join(" / ");

                      return (
                        <tr key={v.id} className="hover:bg-accent/40">
                          <td className="p-2.5 font-medium text-foreground">{attrSpecs || "Default Option"}</td>
                          <td className="p-2.5 font-mono text-muted-foreground">{v.sku}</td>
                          <td className="p-2.5 font-bold text-foreground">${(v.salePrice || v.price).toFixed(2)}</td>
                          <td className="p-2.5 text-muted-foreground">{v.stock} in stock</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(product.id || product._id || "", product.name)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Product
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsModal;
