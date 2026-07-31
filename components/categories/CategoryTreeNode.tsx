"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  Edit3,
  Trash2,
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

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-xl border border-border bg-card/60 hover:bg-card transition-all group",
          level > 0 && "ml-6 sm:ml-8 border-l-2 border-l-indigo-500/40"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-indigo-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            {hasChildren && isExpanded ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
          </div>

          <span className="font-semibold text-sm text-foreground truncate">
            {category.name}
          </span>

          {hasChildren && (
            <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
              {children.length} {children.length === 1 ? "subcategory" : "subcategories"}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {canCreate && (
            <Link
              href={`/categories/new?parentId=${categoryId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "xs" }),
                "gap-1 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              )}
              title="Add Subcategory under this parent"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Add Subcategory</span>
            </Link>
          )}

          {canUpdate && (
            <Link
              href={`/categories/${categoryId}/edit`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 w-8 p-0 text-primary"
              )}
              title="Edit Category"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(categoryId, category.name)}
              title="Delete Category"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Render Nested Children Recursive Tree */}
      {hasChildren && isExpanded && (
        <div className="space-y-1 pt-1">
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
