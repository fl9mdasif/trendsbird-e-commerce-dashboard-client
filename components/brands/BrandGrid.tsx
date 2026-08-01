"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit3, Trash2, CheckCircle2, Calendar, Award } from "lucide-react";
import { IBrand } from "@/types/common";

interface BrandGridProps {
  brandsList: IBrand[];
  onEdit: (brand: IBrand) => void;
  onDelete: (id: string, name: string) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

// Eye-catching vibrant brand avatar gradient themes
const BRAND_GRADIENTS = [
  "from-indigo-600 via-purple-600 to-pink-600 text-white shadow-indigo-500/25",
  "from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-emerald-500/25",
  "from-amber-500 via-orange-600 to-rose-600 text-white shadow-amber-500/25",
  "from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-cyan-500/25",
  "from-fuchsia-600 via-pink-600 to-rose-600 text-white shadow-fuchsia-500/25",
  "from-violet-600 via-purple-600 to-indigo-600 text-white shadow-violet-500/25",
];

function getBrandGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % BRAND_GRADIENTS.length;
  return BRAND_GRADIENTS[idx];
}

export function BrandGrid({
  brandsList,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: BrandGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {brandsList.map((brand) => {
        const brandId = brand.id || brand._id || "";
        const initial = brand.name ? brand.name.charAt(0).toUpperCase() : "B";
        const gradientClass = getBrandGradient(brand.name);

        return (
          <div
            key={brandId}
            className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/70 backdrop-blur-md hover:bg-card hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl p-5 flex flex-col justify-between"
          >
            {/* Vibrant Ambient Top Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Card Header: Brand Avatar & Actions */}
              <div className="flex items-start justify-between gap-3">
                {/* Modern Brand Stylized Initial Avatar */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-extrabold text-2xl tracking-tight shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0",
                    gradientClass
                  )}
                >
                  {initial}
                </div>

                {/* Verified Pill Badge & Action Buttons */}
                <div className="flex items-center gap-1">
                  {canUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
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
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      onClick={() => onDelete(brandId, brand.name)}
                      title="Delete Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Brand Title & Info */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-foreground text-lg tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {brand.name}
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Official Brand Entity</span>
                </div>
              </div>
            </div>

            {/* Card Footer: Metadata info */}
            <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "Active"}</span>
              </div>

              <Badge variant="outline" className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border-indigo-500/20 px-2 py-0.5">
                Active
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BrandGrid;
