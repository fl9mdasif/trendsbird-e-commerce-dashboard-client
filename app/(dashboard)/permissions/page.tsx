"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import {
  useGetAllPermissionsQuery,
  useDeletePermissionMutation,
  useUpdatePermissionMutation,
} from "@/redux/api/permissionApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Plus, Shield, CheckCircle, XCircle, Trash2, Edit3, Grid, List } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { IPermission, IApiResponse } from "@/types/common";

interface IFormattedModule {
  module: string;
  actions: string[];
}

const DEFAULT_MODULES: IFormattedModule[] = [
  { module: "dashboard", actions: ["watch", "read"] },
  { module: "permission", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "role", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "user", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "media", actions: ["watch", "read", "create", "update", "delete", "upload"] },
  { module: "category", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "brand", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "attribute", actions: ["watch", "read", "create", "update", "delete"] },
  { module: "product", actions: ["watch", "read", "create", "update", "delete"] },
];

export default function PermissionsPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"modules" | "all">("modules");

  // Edit Modal State
  const [editingPermission, setEditingPermission] = useState<IPermission | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch all permissions (limit: 100)
  const { data: response, isLoading, error, refetch } = useGetAllPermissionsQuery({
    search: searchTerm,
    page: 1,
    limit: 100,
  });

  const [deletePermission] = useDeletePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  // Memoize permissionsList to satisfy ESLint react-hooks/exhaustive-deps
  const permissionsList = useMemo<IPermission[]>(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IPermission[]>).data)) {
      return (response as IApiResponse<IPermission[]>).data;
    }
    return [];
  }, [response]);

  // Group flat permission items from DB by module
  const formattedModules = useMemo<IFormattedModule[]>(() => {
    if (permissionsList.length > 0) {
      const groups: Record<string, string[]> = {};

      permissionsList.forEach((item) => {
        const name = item.name;
        if (name && typeof name === "string") {
          if (name.includes(":")) {
            const [mod, act] = name.split(":");
            const cleanMod = mod.toLowerCase().trim();
            const cleanAct = act.toLowerCase().trim();
            if (!groups[cleanMod]) groups[cleanMod] = [];
            if (!groups[cleanMod].includes(cleanAct)) groups[cleanMod].push(cleanAct);
          } else {
            // Non-colon permission (e.g. "test")
            const cleanMod = name.toLowerCase().trim();
            if (!groups[cleanMod]) groups[cleanMod] = [];
            if (!groups[cleanMod].includes("read")) groups[cleanMod].push("read");
          }
        }
      });

      const allModulesSet = new Set([
        ...DEFAULT_MODULES.map((m) => m.module),
        ...Object.keys(groups),
      ]);

      return Array.from(allModulesSet).map((mod) => {
        const dbActions = groups[mod] || [];
        const defaultActions = DEFAULT_MODULES.find((m) => m.module === mod)?.actions || [];
        const mergedActions = Array.from(new Set([...dbActions, ...defaultActions]));

        return {
          module: mod,
          actions: mergedActions,
        };
      });
    }

    return DEFAULT_MODULES;
  }, [permissionsList]);

  // Handle Delete Permission
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
      const errorObj = err as { message?: string; data?: { message?: string } };
      toast({
        title: "Error Deleting Permission",
        description: errorObj?.message || errorObj?.data?.message || "Failed to delete permission.",
        type: "error",
      });
    }
  };

  // Open Edit Modal
  const openEditModal = (item: IPermission) => {
    setEditingPermission(item);
    setEditName(item.name || "");
    setEditDescription(item.description || "");
  };

  // Handle Save Permission Edit
  const handleSaveEdit = async () => {
    if (!editingPermission) return;
    if (!editName.trim()) {
      toast({
        title: "Validation Error",
        description: "Permission name cannot be empty.",
        type: "error",
      });
      return;
    }

    try {
      await updatePermission({
        id: editingPermission.id,
        data: {
          name: editName.trim(),
          description: editDescription.trim(),
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
      const errorObj = err as { message?: string; data?: { message?: string } };
      toast({
        title: "Error Updating Permission",
        description: errorObj?.message || errorObj?.data?.message || "Failed to update permission.",
        type: "error",
      });
    }
  };

  // Filter modules based on search term
  const filteredModules = formattedModules.filter((m) =>
    m.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter raw permissions based on search term
  const filteredRawPermissions = permissionsList.filter((item) => {
    const permName = item.name || "";
    return permName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        const displayActions = Array.from(
          new Set([...actions, "read", "create", "update", "delete"])
        );

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

  // Table Columns for All Individual DB Permissions List (with Edit & Delete)
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
      cell: ({ row }) => {
        const dateStr = row.original.createdAt;
        return (
          <span className="text-xs text-muted-foreground">
            {dateStr ? new Date(dateStr).toLocaleDateString() : "—"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        const itemId = item.id;

        return (
          <div className="flex items-center gap-2">
            {can("permission:update") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-primary"
                onClick={() => openEditModal(item)}
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
                onClick={() => handleDeletePermission(itemId, item.name)}
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
          {/* View Mode Switcher */}
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
        columns={viewMode === "modules" ? (moduleColumns as any) : (rawPermissionColumns as any)}
        data={viewMode === "modules" ? filteredModules : filteredRawPermissions}
        isLoading={isLoading}
        error={error ? "Failed to load permissions list from server." : null}
        onRetry={refetch}
        searchPlaceholder={
          viewMode === "modules" ? "Search module permissions..." : "Search permission names..."
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pageIndex={page}
        pageCount={(response as IApiResponse)?.meta?.pageCount || 1}
        onPageChange={setPage}
        emptyMessage="No permissions found."
      />

      {/* Edit Permission Modal */}
      {editingPermission && (
        <Dialog open={Boolean(editingPermission)} onOpenChange={() => setEditingPermission(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Edit Permission
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Permission Identifier *</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. test, report:read"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Permission description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPermission(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
