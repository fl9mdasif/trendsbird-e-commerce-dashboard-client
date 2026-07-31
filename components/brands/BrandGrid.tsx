"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Edit3, Trash2 } from "lucide-react";
import { IBrand } from "@/types/common";

interface BrandGridProps {
  brandsList: IBrand[];
  onEdit: (brand: IBrand) => void;
  onDelete: (id: string, name: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export function BrandGrid({
  brandsList,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: BrandGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {brandsList.map((brand) => {
        const brandId = brand.id || brand._id || "";

        return (
          <div
            key={brandId}
            className="group relative p-5 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-indigo-500/30 transition-all flex items-center justify-between shadow-sm min-h-[90px]"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-foreground text-base truncate">{brand.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Created {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "recently"}
                </p>
              </div>
            </div>

            {/* Column-wise Action Buttons placed at far right */}
            <div className="flex flex-col items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity ml-4 pl-3 border-l border-border/50 shrink-0">
              {canUpdate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-primary hover:bg-indigo-500/10"
                  onClick={() => onEdit(brand)}
                  title="Edit Brand"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-rose-500/10"
                  onClick={() => onDelete(brandId, brand.name)}
                  title="Delete Brand"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BrandGrid;
