"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { useGetAllRolesQuery, useDeleteRoleMutation } from "@/redux/api/roleApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import { Plus, Edit3, Trash2, Shield, UserCheck } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "@/components/ui/toast";

export default function RolesPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Send `search: searchTerm` as expected by backend controller
  const { data: response, isLoading, error, refetch } = useGetAllRolesQuery({
    search: searchTerm,
    page,
    limit: 10,
  });

  const [deleteRole] = useDeleteRoleMutation();

  const rolesList: any[] = (response as any)?.data || response || [];

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
    } catch (err: any) {
      toast({
        title: "Error Deleting Role",
        description: err?.message || err?.data?.message || "Failed to delete role.",
        type: "error",
      });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-foreground capitalize block">
              {row.original.name || row.original.title}
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
      cell: ({ row }: { row: { original: any } }) => {
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
      cell: ({ row }: { row: { original: any } }) => {
        const perms = row.original.permissions || [];
        return (
          <Badge variant="secondary" className="font-medium">
            {Array.isArray(perms) ? perms.length : 0} Permissions
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: any } }) => {
        const role = row.original;
        const roleId = role._id || role.id;

        return (
          <div className="flex items-center gap-2">
            {can("role:update") && (
              <Link
                href={`/roles/${roleId}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0")}
                title="Edit Role"
              >
                <Edit3 className="w-4 h-4 text-primary" />
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
        columns={columns}
        data={rolesList}
        isLoading={isLoading}
        error={error ? "Failed to load roles list." : null}
        onRetry={refetch}
        searchPlaceholder="Search roles..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pageIndex={page}
        pageCount={(response as any)?.meta?.pageCount || 1}
        onPageChange={setPage}
        emptyMessage="No roles found."
      />
    </div>
  );
}
