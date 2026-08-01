"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { BrandGrid } from "@/components/brands/BrandGrid";
import { BrandModal } from "@/components/brands/BrandModal";
import { GridSkeleton, TableSkeleton } from "@/components/shared/Skeletons";
import {
  useGetAllBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "@/redux/api/brandApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { showErrorToast, getErrorMessage } from "@/lib/utils";
import { Plus, Edit3, Trash2, Tag, Search, Grid, List } from "lucide-react";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { IBrand, IApiResponse } from "@/types/common";
import { filterBrandsBySearch } from "./function.brand";

export default function BrandsPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);

  // Fetch Brands from Server
  const { data: response, isLoading, error, refetch } = useGetAllBrandsQuery({
    search: searchTerm,
    page: 1,
    limit: 100,
  });

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const rawBrandsList: IBrand[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IBrand[]>).data)) {
      return (response as IApiResponse<IBrand[]>).data;
    }
    return [];
  }, [response]);

  const brandsList = useMemo(() => {
    return filterBrandsBySearch(rawBrandsList, searchTerm);
  }, [rawBrandsList, searchTerm]);

  const openCreateModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: IBrand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (name: string) => {
    try {
      if (editingBrand) {
        const brandId = editingBrand.id || editingBrand._id || "";
        await updateBrand({ id: brandId, data: { name } }).unwrap();
        toast({ title: "Brand Updated", description: `Brand '${name}' updated successfully.`, type: "success" });
      } else {
        await createBrand({ name }).unwrap();
        toast({ title: "Brand Created", description: `Brand '${name}' created successfully.`, type: "success" });
      }
      setIsModalOpen(false);
      setEditingBrand(null);
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to save brand.");
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete brand '${name}'?`)) return;
    try {
      await deleteBrand(id).unwrap();
      toast({ title: "Brand Deleted", description: `Brand '${name}' deleted successfully.`, type: "success" });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete brand.");
    }
  };

  const tableColumns: ColumnDef<IBrand>[] = [
    {
      accessorKey: "name",
      header: "Brand Name",
      cell: ({ row }: CellContext<IBrand, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
            <Tag className="w-4 h-4" />
          </div>
          <span className="font-semibold text-foreground">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }: CellContext<IBrand, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: CellContext<IBrand, unknown>) => {
        const b = row.original;
        const brandId = b.id || b._id || "";
        return (
          <div className="flex items-center gap-2">
            {can("brand:update") && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary" onClick={() => openEditModal(b)}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            {can("brand:delete") && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteBrand(brandId, b.name)}>
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
      <PageHeader title="Brand Management" description="Configure product manufacturers and brand entities.">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="gap-1.5 text-xs font-medium">
              <Grid className="w-3.5 h-3.5" /> Grid
            </Button>
            <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="gap-1.5 text-xs font-medium">
              <List className="w-3.5 h-3.5" /> Table
            </Button>
          </div>
          {can("brand:create") && (
            <Button onClick={openCreateModal} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add New Brand
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search brands..." className="pl-9" />
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 font-medium text-xs">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          <span>{brandsList.length} Brands</span>
        </Badge>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <GridSkeleton count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" />
        ) : (
          <TableSkeleton rows={5} />
        )
      ) : error ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card p-6">
          <p className="text-destructive font-medium text-sm">{getErrorMessage(error, "Failed to load brands.")}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">Retry Loading</Button>
        </div>
      ) : brandsList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
          <Tag className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No brands found.</p>
        </div>
      ) : viewMode === "grid" ? (
        <BrandGrid
          brandsList={brandsList}
          onEdit={openEditModal}
          onDelete={handleDeleteBrand}
          canUpdate={can("brand:update")}
          canDelete={can("brand:delete")}
        />
      ) : (
        <DataTable
          columns={tableColumns as ColumnDef<IBrand>[]}
          data={brandsList}
          isLoading={isLoading}
          error={error ? getErrorMessage(error, "Failed to load brands.") : null}
          onRetry={refetch}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          emptyMessage="No brands found."
        />
      )}

      {isModalOpen && (
        <BrandModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          initialBrand={editingBrand}
          onSubmit={handleSaveBrand}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
