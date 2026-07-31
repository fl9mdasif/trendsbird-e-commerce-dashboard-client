"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllRolesQuery, useDeleteRoleMutation } from "@/redux/api/roleApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePermission } from "@/hooks/usePermission";
import { cn, showErrorToast, getErrorMessage } from "@/lib/utils";
import { Plus, Edit3, Trash2, Shield, UserCheck, Eye, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { toast } from "@/components/ui/toast";
import { IRole, IApiResponse, TPermissionItem } from "@/types/common";

export default function RolesPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [viewingRole, setViewingRole] = useState<IRole | null>(null);

  // Send `search: searchTerm` as expected by backend controller
  const { data: response, isLoading, error, refetch } = useGetAllRolesQuery({
    search: searchTerm,
    page,
    limit: 10,
  });

  const [deleteRole] = useDeleteRoleMutation();

  const rolesList: IRole[] = (response as IApiResponse<IRole[]>)?.data || (response as IRole[]) || [];

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete role '${name}'?`)) return;

    try {
      await deleteRole(id).unwrap();
      toast({
        title: "Role Deleted",
        description: `Role '${name}' has been deleted successfully.`,
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete role.");
    }
  };

  // Helper to extract clean permission string names array using TPermissionItem interface
  const extractPermissionNames = (permissionsData?: TPermissionItem[]): string[] => {
    if (!Array.isArray(permissionsData)) return [];
    return permissionsData
      .map((p: TPermissionItem) => {
        if (typeof p === "string") return p;
        if (typeof p === "object" && p !== null) {
          if ("permission" in p && p.permission) {
            if (typeof p.permission === "string") return p.permission;
            if (typeof p.permission === "object" && p.permission !== null) {
              return p.permission.name || p.permission.id || p.permission.permissionId || p.permissionId || "";
            }
          }
          return p.name || p.permissionId || p.id || "";
        }
        return "";
      })
      .filter((p): p is string => typeof p === "string" && Boolean(p));
  };

  // Group permission names by module for modal display
  const groupPermissionsByModule = (permNames: string[]) => {
    const groups: Record<string, string[]> = {};
    permNames.forEach((name) => {
      if (name.includes(":")) {
        const [mod, act] = name.split(":");
        const cleanMod = mod.toLowerCase().trim();
        const cleanAct = act.toLowerCase().trim();
        if (!groups[cleanMod]) groups[cleanMod] = [];
        if (!groups[cleanMod].includes(cleanAct)) groups[cleanMod].push(cleanAct);
      } else {
        const cleanMod = name.toLowerCase().trim();
        if (!groups[cleanMod]) groups[cleanMod] = [];
        if (!groups[cleanMod].includes("read")) groups[cleanMod].push("read");
      }
    });
    return groups;
  };

  const columns: ColumnDef<IRole>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }: CellContext<IRole, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-foreground capitalize block">
              {row.original.name}
            </span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground block truncate max-w-xs">
                {row.original.description}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "userCount",
      header: "Users Count",
      cell: ({ row }: CellContext<IRole, unknown>) => {
        const count = row.original.userCount ?? row.original.usersCount ?? row.original.users?.length ?? 0;
        return (
          <Badge variant="outline" className="gap-1 px-2.5 py-0.5">
            <UserCheck className="w-3 h-3 text-emerald-500" />
            <span>{count} Users</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions Count",
      cell: ({ row }: CellContext<IRole, unknown>) => {
        const perms = extractPermissionNames(row.original.permissions);
        return (
          <Badge variant="secondary" className="font-medium gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            <span>{perms.length} Permissions</span>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: CellContext<IRole, unknown>) => {
        const role = row.original;
        const roleId = role._id || role.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10"
              onClick={() => setViewingRole(role)}
              title="View Role Permissions"
            >
              <Eye className="w-4 h-4" />
            </Button>

            {can("role:update") && (
              <Link
                href={`/roles/${roleId}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0 text-primary")}
                title="Edit Role"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
            )}

            {can("role:delete") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleDelete(roleId, role.name)}
                title="Delete Role"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const viewingRolePermNames = extractPermissionNames(viewingRole?.permissions);
  const groupedViewPermissions = groupPermissionsByModule(viewingRolePermNames);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description="Configure system roles and matrix permission access."
      >
        {can("role:create") && (
          <Link
            href="/roles/new"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
          >
            <Plus className="w-4 h-4" />
            Create New Role
          </Link>
        )}
      </PageHeader>

      <DataTable
        columns={columns as ColumnDef<IRole>[]}
        data={rolesList}
        isLoading={isLoading}
        error={error ? getErrorMessage(error, "Failed to load roles list.") : null}
        onRetry={refetch}
        searchPlaceholder="Search roles..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pageIndex={page}
        pageCount={(response as IApiResponse)?.meta?.pageCount || 1}
        onPageChange={setPage}
        emptyMessage="No roles found."
      />

      {/* View Role Permissions Modal Popup */}
      {viewingRole && (
        <Dialog open={Boolean(viewingRole)} onOpenChange={() => setViewingRole(null)}>
          <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Role Permissions: {viewingRole.name}</span>
                <Badge variant="secondary" className="ml-auto font-medium text-xs">
                  {viewingRolePermNames.length} Total Permissions
                </Badge>
              </DialogTitle>
              {viewingRole.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {viewingRole.description}
                </p>
              )}
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 py-3 custom-scrollbar">
              {Object.keys(groupedViewPermissions).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No permissions currently assigned to this role.
                </div>
              ) : (
                Object.entries(groupedViewPermissions).map(([moduleName, actions]) => (
                  <div
                    key={moduleName}
                    className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm capitalize text-foreground flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        {moduleName} Module
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {actions.length} action{actions.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {actions.map((action) => (
                        <Badge
                          key={action}
                          variant="outline"
                          className="text-xs capitalize py-0.5 px-2.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-medium gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setViewingRole(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
