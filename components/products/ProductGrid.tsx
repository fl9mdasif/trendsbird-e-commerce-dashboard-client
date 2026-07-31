"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Eye, Trash2, Layers, AlertTriangle } from "lucide-react";
import { IProduct } from "@/types/common";
import {
  formatProductPrice,
  formatProductStock,
  extractProductThumbnail,
} from "@/app/(dashboard)/products/function.product";

interface ProductGridProps {
  productsList: IProduct[];
  onSelect: (product: IProduct) => void;
  onDelete: (id: string, name: string) => void;
  canDelete: boolean;
}

export function ProductGrid({
  productsList,
  onSelect,
  onDelete,
  canDelete,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {productsList.map((product) => {
        const productId = product.id || product._id || "";
        const thumbnail = extractProductThumbnail(product);
        const priceInfo = formatProductPrice(product);
        const stockInfo = formatProductStock(product);
        const categoryNames = product.categories
          ?.map((c) => c.category?.name)
          .filter(Boolean);

        return (
          <div
            key={productId}
            className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-indigo-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            onClick={() => onSelect(product)}
          >
            <div>
              {/* Product Thumbnail Header */}
              <div className="relative aspect-video w-full bg-slate-950/60 overflow-hidden flex items-center justify-center border-b border-border">
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/50">
                    <Package className="w-8 h-8" />
                    <span className="text-[10px] font-medium">No Image Attached</span>
                  </div>
                )}

                {/* Has Variants Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                  {product.hasVariants ? (
                    <Badge className="bg-indigo-600/90 text-white text-[10px] font-semibold gap-1 px-2 py-0.5 shadow-sm">
                      <Layers className="w-3 h-3" />
                      Variable
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5 shadow-sm">
                      Simple
                    </Badge>
                  )}
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(product);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Details
                  </Button>
                </div>
              </div>

              {/* Product Body Content */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  {product.brand && (
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                      {product.brand.name}
                    </span>
                  )}
                  <h4 className="font-bold text-foreground text-sm line-clamp-1" title={product.name}>
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Category Tags */}
                {categoryNames && categoryNames.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {categoryNames.slice(0, 2).map((catName) => (
                      <Badge
                        key={catName}
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 bg-indigo-500/5 text-indigo-400 border-indigo-500/20"
                      >
                        {catName}
                      </Badge>
                    ))}
                    {categoryNames.length > 2 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{categoryNames.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Product Footer: Price, Stock, Inspect & Delete Actions */}
            <div className="p-4 pt-3 border-t border-border flex items-center justify-between bg-card/50">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-foreground">
                    {priceInfo.mainPrice}
                  </span>
                  {priceInfo.salePrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {priceInfo.salePrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  {stockInfo.isLow && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  <span>{stockInfo.text}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Inspect Action */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(product);
                  }}
                  title="Inspect Product Specs"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                {/* Edit Action Button (Hidden - Assignment requirement has no update option)
                <Link
                  href={`/products/${productId}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 p-0 text-primary hover:bg-indigo-500/10"
                  title="Edit Product"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                */}

                {/* Delete Action */}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-rose-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(productId, product.name);
                    }}
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductGrid;
