"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { PermissionEditModal } from "@/components/permissions/PermissionEditModal";
import {
  useGetAllPermissionsQuery,
  useDeletePermissionMutation,
  useUpdatePermissionMutation,
} from "@/redux/api/permissionApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { cn, showErrorToast, getErrorMessage } from "@/lib/utils";
import { Plus, Shield, CheckCircle, XCircle, Trash2, Edit3, Grid, List } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { IPermission, IApiResponse } from "@/types/common";
import {
  formatPermissionsToModules,
  filterFormattedModules,
  filterRawPermissions,
  IFormattedModule,
} from "./function.permission";

export default function PermissionsPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"modules" | "all">("modules");
  const [editingPermission, setEditingPermission] = useState<IPermission | null>(null);

  // Fetch all permissions from DB
  const { data: response, isLoading, error, refetch } = useGetAllPermissionsQuery({
    search: searchTerm,
    page: 1,
    limit: 100,
  });

  const [deletePermission] = useDeletePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  const permissionsList = useMemo<IPermission[]>(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IPermission[]>).data)) {
      return (response as IApiResponse<IPermission[]>).data;
    }
    return [];
  }, [response]);

  const formattedModules = useMemo(() => {
    return formatPermissionsToModules(permissionsList);
  }, [permissionsList]);

  const filteredModules = useMemo(() => {
    return filterFormattedModules(formattedModules, searchTerm);
  }, [formattedModules, searchTerm]);

  const filteredRawPermissions = useMemo(() => {
    return filterRawPermissions(permissionsList, searchTerm);
  }, [permissionsList, searchTerm]);

  const handleDeletePermission = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete permission '${name}'?`)) return;

    try {
      await deletePermission(id).unwrap();
      toast({
        title: "Permission Deleted",
        description: `Permission '${name}' deleted successfully.`,
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete permission.");
    }
  };

  const handleSaveEdit = async (data: { name: string; description: string }) => {
    if (!editingPermission) return;

    try {
      await updatePermission({
        id: editingPermission.id,
        data: {
          name: data.name,
          description: data.description,
        },
      }).unwrap();

      toast({
        title: "Permission Updated",
        description: `Permission updated successfully.`,
        type: "success",
      });

      setEditingPermission(null);
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to update permission.");
    }
  };

  // Table Columns for Grouped View
  const moduleColumns: ColumnDef<IFormattedModule>[] = [
    {
      accessorKey: "module",
      header: "Module Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-semibold capitalize text-foreground">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span>{row.original.module}</span>
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Available Actions",
      cell: ({ row }) => {
        const actions: string[] = row.original.actions || [];
        const displayActions = Array.from(new Set([...actions, "read", "create", "update", "delete"]));

        return (
          <div className="flex flex-wrap items-center gap-2">
            {displayActions.map((act) => {
              const hasAction =
                actions.includes(act) ||
                (act === "read" && actions.includes("watch")) ||
                (act === "watch" && actions.includes("read"));

              return (
                <Badge
                  key={act}
                  variant={hasAction ? "default" : "outline"}
                  className={cn(
                    "text-xs capitalize font-medium py-0.5 px-2.5 gap-1",
                    hasAction
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30"
                      : "text-muted-foreground opacity-40"
                  )}
                >
                  {hasAction ? (
                    <CheckCircle className="w-3 h-3 text-indigo-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-muted-foreground" />
                  )}
                  {act}
                </Badge>
              );
            })}
          </div>
        );
      },
    },
  ];

  // Table Columns for All Individual DB Permissions List
  const rawPermissionColumns: ColumnDef<IPermission>[] = [
    {
      accessorKey: "name",
      header: "Permission Identifier",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono font-medium text-foreground">
          <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description || "No description specified"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            {can("permission:update") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-primary"
                onClick={() => setEditingPermission(item)}
                title="Edit Permission"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            {can("permission:delete") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleDeletePermission(item.id, item.name)}
                title="Delete Permission"
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
        title="Permission Management"
        description="View, edit, and configure system module action permissions."
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              variant={viewMode === "modules" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("modules")}
              className="gap-1.5 text-xs font-medium"
            >
              <Grid className="w-3.5 h-3.5" />
              Module Groups
            </Button>
            <Button
              variant={viewMode === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("all")}
              className="gap-1.5 text-xs font-medium"
            >
              <List className="w-3.5 h-3.5" />
              All DB Permissions ({permissionsList.length})
            </Button>
          </div>

          {can("permission:create") && (
            <Link
              href="/permissions/new"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
            >
              <Plus className="w-4 h-4" />
              Create Permission
            </Link>
          )}
        </div>
      </PageHeader>

      <DataTable
        columns={(viewMode === "modules" ? moduleColumns : rawPermissionColumns) as ColumnDef<unknown>[]}
        data={(viewMode === "modules" ? filteredModules : filteredRawPermissions) as unknown[]}
        isLoading={isLoading}
        error={error ? getErrorMessage(error, "Failed to load permissions list from server.") : null}
        onRetry={refetch}
        searchPlaceholder={viewMode === "modules" ? "Search module permissions..." : "Search permission names..."}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pageIndex={page}
        pageCount={(response as IApiResponse)?.meta?.pageCount || 1}
        onPageChange={setPage}
        emptyMessage="No permissions found."
      />

      {editingPermission && (
        <PermissionEditModal
          permission={editingPermission}
          onClose={() => setEditingPermission(null)}
          onSubmit={handleSaveEdit}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}
