"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { CategoryTreeNode } from "@/components/categories/CategoryTreeNode";
import {
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/api/categoryApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { showErrorToast, cn, getErrorMessage } from "@/lib/utils";
import {
  Plus,
  Edit3,
  Trash2,
  FolderTree,
  Folder,
  Search,
  List,
  PlusCircle,
} from "lucide-react";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { ICategory, IApiResponse } from "@/types/common";
import { filterCategoryTree } from "./function.category";

export default function CategoriesPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");

  // Fetch Tree Categories Response
  const { data: treeRes, isLoading: isTreeLoading, error: treeError, refetch } = useGetAllCategoriesQuery({ tree: "true" });
  // Fetch Flat Categories Response for Table View
  const { data: flatRes } = useGetAllCategoriesQuery();

  const [deleteCategory] = useDeleteCategoryMutation();

  const treeCategories: ICategory[] =
    (treeRes as IApiResponse<ICategory[]>)?.data ||
    (treeRes as unknown as ICategory[]) ||
    [];

  const flatCategories: ICategory[] =
    (flatRes as IApiResponse<ICategory[]>)?.data ||
    (flatRes as unknown as ICategory[]) ||
    [];

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category '${name}'?`)) return;

    try {
      await deleteCategory(id).unwrap();
      toast({
        title: "Category Deleted",
        description: `Category '${name}' deleted successfully.`,
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete category.");
    }
  };

  const filteredTreeCategories = filterCategoryTree(treeCategories, searchTerm);

  // Flat Table Columns
  const tableColumns: ColumnDef<ICategory>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }: CellContext<ICategory, unknown>) => (
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "parentId",
      header: "Parent Category",
      cell: ({ row }: CellContext<ICategory, unknown>) => {
        const parentId = row.original.parentId;
        const parentCat = flatCategories.find((c) => (c.id || c._id) === parentId);

        return parentCat ? (
          <Badge variant="outline" className="gap-1 font-medium bg-indigo-500/5 text-indigo-400 border-indigo-500/20">
            <FolderTree className="w-3 h-3 text-indigo-400" />
            {parentCat.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Root Category</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: CellContext<ICategory, unknown>) => {
        const cat = row.original;
        const catId = cat.id || cat._id || "";

        return (
          <div className="flex items-center gap-2">
            {can("category:create") && (
              <Link
                href={`/categories/new?parentId=${catId}`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0 text-indigo-400")}
                title="Add Subcategory"
              >
                <PlusCircle className="w-4 h-4" />
              </Link>
            )}

            {can("category:update") && (
              <Link
                href={`/categories/${catId}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0 text-primary")}
                title="Edit Category"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
            )}

            {can("category:delete") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleDelete(catId, cat.name)}
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Hierarchy Management"
        description="Organize product categories and subcategories in a nested tree hierarchy."
      >
        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              variant={viewMode === "tree" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tree")}
              className="gap-1.5 text-xs font-medium"
            >
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              Tree View
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-1.5 text-xs font-medium"
            >
              <List className="w-3.5 h-3.5" />
              Flat Table
            </Button>
          </div>

          {can("category:create") && (
            <Link
              href="/categories/new"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
            >
              <Plus className="w-4 h-4" />
              Add Root Category
            </Link>
          )}
        </div>
      </PageHeader>

      {/* Search Input Filter */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search category hierarchy..."
          className="pl-9"
        />
      </div>

      {/* Category Tree View */}
      {viewMode === "tree" ? (
        <div className="space-y-2">
          {isTreeLoading ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Loading category hierarchy tree...
            </div>
          ) : treeError ? (
            <div className="text-center py-12 border border-border rounded-xl bg-card p-4">
              <p className="text-destructive text-sm font-medium">
                {getErrorMessage(treeError, "Failed to load category tree.")}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                Retry Loading
              </Button>
            </div>
          ) : filteredTreeCategories.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/40 text-muted-foreground text-sm">
              No categories found in tree.
            </div>
          ) : (
            filteredTreeCategories.map((cat) => (
              <CategoryTreeNode
                key={cat.id || cat._id}
                category={cat}
                onDelete={handleDelete}
                canCreate={can("category:create")}
                canUpdate={can("category:update")}
                canDelete={can("category:delete")}
              />
            ))
          )}
        </div>
      ) : (
        /* Flat Table View */
        <DataTable
          columns={tableColumns as ColumnDef<ICategory>[]}
          data={flatCategories.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))}
          isLoading={isTreeLoading}
          error={treeError ? getErrorMessage(treeError, "Failed to load categories.") : null}
          onRetry={refetch}
          searchPlaceholder="Search categories..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          emptyMessage="No categories found."
        />
      )}
    </div>
  );
}
