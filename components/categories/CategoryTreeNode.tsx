"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {PALETTES}  from "../categories/category.color";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  Edit3,
  Trash2,
  CornerDownRight,
} from "lucide-react";
import { ICategory } from "@/types/common";

interface CategoryTreeNodeProps {
  category: ICategory;
  level?: number;
  onDelete: (id: string, name: string) => void;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Deterministically get a unique vibrant palette for each category by its name / id
 */
function getPalette(idOrName: string) {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PALETTES.length;
  return PALETTES[idx];
}

export function CategoryTreeNode({
  category,
  level = 0,
  onDelete,
  canCreate,
  canUpdate,
  canDelete,
}: CategoryTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const children = category.children || [];
  const hasChildren = children.length > 0;
  const categoryId = category.id || category._id || "";

  // Unique vibrant palette for this specific category card
  const palette = getPalette(category.name + (category.id || ""));

  // Level-based left margin indentation
  const getIndentMargin = (lvl: number) => {
    switch (lvl) {
      case 0:
        return "ml-0";
      case 1:
        return "ml-4 sm:ml-6";
      case 2:
        return "ml-8 sm:ml-12";
      default:
        return "ml-12 sm:ml-16";
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-2xl border border-l-4 transition-all duration-200 group shadow-xs backdrop-blur-xs hover:shadow-md hover:scale-[1.005]",
          getIndentMargin(level),
          palette.border,
          palette.bg
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Tree Branch Connector Icon */}
          {level > 0 && (
            <CornerDownRight className={cn("w-3.5 h-3.5 shrink-0 -ml-1", palette.treeIcon)} />
          )}

          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className={cn("w-4 h-4", palette.treeIcon)} />
              ) : (
                <ChevronRight className={cn("w-4 h-4", palette.treeIcon)} />
              )}
            </button>
          ) : (
            <div className="w-5 shrink-0" />
          )}

          {/* Eye-catching Vibrant Icon Badge */}
          <div className={cn("p-2 rounded-xl font-bold shrink-0 shadow-xs", palette.iconBg)}>
            {hasChildren && isExpanded ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
          </div>

          <span className="font-extrabold text-xs sm:text-sm text-foreground truncate tracking-tight">
            {category.name}
          </span>

          {hasChildren && (
            <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 border", palette.badge)}>
              {children.length} {children.length === 1 ? "sub" : "subs"}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
          {canCreate && (
            <Link
              href={`/categories/new?parentId=${categoryId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "xs" }),
                "gap-1 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-7 px-2"
              )}
              title="Add Subcategory under this parent"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-xs">Add Sub</span>
            </Link>
          )}

          {canUpdate && (
            <Link
              href={`/categories/${categoryId}/edit`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-7 w-7 p-0 text-primary hover:bg-indigo-500/10"
              )}
              title="Edit Category"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-rose-500/10"
              onClick={() => onDelete(categoryId, category.name)}
              title="Delete Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Render Nested Children Recursive Tree */}
      {hasChildren && isExpanded && (
        <div className="space-y-1.5">
          {children.map((child) => (
            <CategoryTreeNode
              key={child.id || child._id}
              category={child}
              level={level + 1}
              onDelete={onDelete}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryTreeNode;
