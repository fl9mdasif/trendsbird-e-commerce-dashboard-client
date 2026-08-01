"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { GridSkeleton, TableSkeleton } from "@/components/shared/Skeletons";
import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
} from "@/redux/api/productApi";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { showErrorToast, cn, getErrorMessage } from "@/lib/utils";
import {
  Plus,
  Eye,
  Trash2,
  Package,
  Search,
  Grid,
  List,
  Layers,
} from "lucide-react";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { IProduct, IBrand, ICategory, IApiResponse } from "@/types/common";
import {
  formatProductPrice,
  formatProductStock,
  filterProductsBySearch,
} from "./function.product";

export default function ProductsPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  // Fetch Products
  const { data: response, isLoading, error, refetch } = useGetAllProductsQuery({
    search: searchTerm,
    brandId: selectedBrandId || undefined,
    page: 1,
    limit: 100,
  });

  const { data: brandsRes } = useGetAllBrandsQuery();
  const { data: categoriesRes } = useGetAllCategoriesQuery();
  const { data: treeCategoriesRes } = useGetAllCategoriesQuery({ tree: "true" });

  const [deleteProduct] = useDeleteProductMutation();

  const rawProductsList: IProduct[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IProduct[]>).data)) {
      return (response as IApiResponse<IProduct[]>).data;
    }
    return [];
  }, [response]);

  const brandsList: IBrand[] =
    (brandsRes as IApiResponse<IBrand[]>)?.data || (brandsRes as unknown as IBrand[]) || [];

  const categoriesList: ICategory[] =
    (categoriesRes as IApiResponse<ICategory[]>)?.data || (categoriesRes as unknown as ICategory[]) || [];

  const treeCategories: ICategory[] =
    (treeCategoriesRes as IApiResponse<ICategory[]>)?.data || (treeCategoriesRes as unknown as ICategory[]) || [];

  const getSubcategoryIds = useMemo(() => {
    const collectIds = (catId: string, treeNodes: ICategory[]): string[] => {
      const ids: string[] = [catId];
      const findNode = (nodes: ICategory[]): ICategory | null => {
        for (const n of nodes) {
          if ((n.id || n._id) === catId) return n;
          if (n.children && n.children.length > 0) {
            const found = findNode(n.children);
            if (found) return found;
          }
        }
        return null;
      };

      const target = findNode(treeNodes);
      if (target && target.children && target.children.length > 0) {
        const gatherChildren = (childrenNodes: ICategory[]) => {
          childrenNodes.forEach((child) => {
            const childId = child.id || child._id || "";
            if (childId) ids.push(childId);
            if (child.children && child.children.length > 0) {
              gatherChildren(child.children);
            }
          });
        };
        gatherChildren(target.children);
      }
      return ids;
    };

    return (catId: string) => collectIds(catId, treeCategories);
  }, [treeCategories]);

  const productsList = useMemo(() => {
    let list = filterProductsBySearch(rawProductsList, searchTerm);

    if (selectedCategoryId) {
      const validCategoryIds = getSubcategoryIds(selectedCategoryId);
      list = list.filter((p) =>
        p.categories?.some((c) => validCategoryIds.includes(c.categoryId))
      );
    }

    return list;
  }, [rawProductsList, searchTerm, selectedCategoryId, getSubcategoryIds]);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product '${name}'?`)) return;

    try {
      await deleteProduct(id).unwrap();
      toast({
        title: "Product Deleted",
        description: `Product '${name}' deleted successfully.`,
        type: "success",
      });
      if (selectedProduct?.id === id) setSelectedProduct(null);
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete product.");
    }
  };

  const tableColumns: ColumnDef<IProduct>[] = [
    {
      accessorKey: "name",
      header: "Product Details",
      cell: ({ row }: CellContext<IProduct, unknown>) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-xs shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-foreground block">{p.name}</span>
              {p.brand && (
                <span className="text-[11px] text-indigo-400 font-medium">
                  {p.brand.name}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "hasVariants",
      header: "Type",
      cell: ({ row }: CellContext<IProduct, unknown>) => {
        const hasVar = row.original.hasVariants;
        return hasVar ? (
          <Badge className="bg-indigo-600/90 text-white text-[10px] gap-1 px-2 py-0.5">
            <Layers className="w-3 h-3" /> Variable
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            Simple
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: CellContext<IProduct, unknown>) => {
        const p = row.original;
        const priceInfo = formatProductPrice(p);
        return <span className="font-extrabold text-foreground text-sm">{priceInfo.mainPrice}</span>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock Units",
      cell: ({ row }: CellContext<IProduct, unknown>) => {
        const p = row.original;
        const stockInfo = formatProductStock(p);
        return <span className="text-xs text-muted-foreground">{stockInfo.text}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: CellContext<IProduct, unknown>) => {
        const p = row.original;
        const pId = p.id || p._id || "";

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              onClick={() => setSelectedProduct(p)}
              title="Inspect Product Specs"
            >
              <Eye className="w-4 h-4" />
            </Button>

            {can("product:delete") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-rose-500/10"
                onClick={() => handleDeleteProduct(pId, p.name)}
                title="Delete Product"
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
        title="Product Catalog Directory"
        description="Manage e-commerce products, variable options, inventory stock, and media."
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-1.5 text-xs font-medium"
            >
              <Grid className="w-3.5 h-3.5" />
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-1.5 text-xs font-medium"
            >
              <List className="w-3.5 h-3.5" />
              Table
            </Button>
          </div>

          {can("product:create") && (
            <Link
              href="/products/new"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
            >
              <Plus className="w-4 h-4" />
              Create Product
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name, subcategory, SKU..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-card text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          >
            <option value="">All Brands</option>
            {brandsList.map((b) => (
              <option key={b.id || b._id} value={b.id || b._id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-card text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          >
            <option value="">All Categories & Subcategories</option>
            {categoriesList.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <Badge variant="outline" className="gap-1.5 px-3 py-2 font-medium text-xs">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>{productsList.length} Products</span>
          </Badge>
        </div>
      </div>

      {/* Grid or Table Content View */}
      {isLoading ? (
        viewMode === "grid" ? (
          <GridSkeleton count={8} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" />
        ) : (
          <TableSkeleton rows={6} />
        )
      ) : error ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card p-6">
          <p className="text-destructive font-medium text-sm">
            {getErrorMessage(error, "Failed to load products.")}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
            Retry Loading
          </Button>
        </div>
      ) : productsList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
          <Package className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No products found matching filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <ProductGrid
          productsList={productsList}
          onSelect={setSelectedProduct}
          onDelete={handleDeleteProduct}
          canDelete={can("product:delete")}
        />
      ) : (
        <DataTable
          columns={tableColumns as ColumnDef<IProduct>[]}
          data={productsList}
          isLoading={isLoading}
          error={error ? getErrorMessage(error, "Failed to load products.") : null}
          onRetry={refetch}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          emptyMessage="No products found."
        />
      )}

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDelete={handleDeleteProduct}
          canDelete={can("product:delete")}
        />
      )}
    </div>
  );
}
