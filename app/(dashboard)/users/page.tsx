"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/redux/api/userApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePermission } from "@/hooks/usePermission";
import { useAppSelector } from "@/redux/hooks";
import { cn, getErrorMessage } from "@/lib/utils";
import { Plus, Edit3, Trash2, Shield, Mail, UserCheck, UserX } from "lucide-react";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { toast } from "@/components/ui/toast";
import { IUser, IApiResponse } from "@/types/common";

export default function UsersPage() {
  const { can } = usePermission();
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data: response, isLoading, error, refetch } = useGetAllUsersQuery({
    search: searchTerm,
    page,
    limit: 10,
  });

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const usersList: IUser[] = (response as IApiResponse<IUser[]>)?.data || (response as unknown as IUser[]) || [];

  const handleDelete = async (id: string, name: string) => {
    if (id === loggedInUser?.id || loggedInUser?.email === name) {
      toast({
        title: "Action Forbidden",
        description: "You cannot delete your own active user account.",
        type: "error",
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user '${name}'?`)) return;

    try {
      await deleteUser(id).unwrap();

      toast({
        title: "User Deleted",
        description: `User '${name}' deleted successfully.`,
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err, "Failed to delete user.");
      toast({
        title: errMsg,
        description: errMsg,
        type: "error",
      });
    }
  };

  const handleToggleStatus = async (user: IUser) => {
    const userId = user.id || user._id || "";
    if (userId === loggedInUser?.id || user.email === loggedInUser?.email) {
      toast({
        title: "Action Forbidden",
        description: "You cannot deactivate your own active session account.",
        type: "error",
      });
      return;
    }

    try {
      await updateUser({
        id: userId,
        data: { active: !user.active },
      }).unwrap();

      toast({
        title: "Status Updated",
        description: `User '${user.name}' account active status updated.`,
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err, "Failed to change user status.");
      toast({
        title: errMsg,
        description: errMsg,
        type: "error",
      });
    }
  };

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "name",
      header: "User Details",
      cell: ({ row }: CellContext<IUser, unknown>) => {
        const u = row.original;
        const initials = u.name
          ? u.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "U";

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {initials}
            </div>
            <div>
              <span className="font-semibold text-foreground block">{u.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 text-muted-foreground/70" />
                {u.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Assigned Role",
      cell: ({ row }: CellContext<IUser, unknown>) => {
        const u = row.original;
        const roleName =
          typeof u.role === "object" && u.role !== null
            ? u.role.name
            : typeof u.role === "string"
            ? u.role
            : "No Role";

        return (
          <Badge variant="outline" className="gap-1.5 px-2.5 py-1 font-medium bg-indigo-500/5 text-indigo-400 border-indigo-500/20">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span className="capitalize">{roleName}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Account Status",
      cell: ({ row }: CellContext<IUser, unknown>) => {
        const u = row.original;
        const isSelf = u.id === loggedInUser?.id || u.email === loggedInUser?.email;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={u.active}
              disabled={isSelf}
              onCheckedChange={() => handleToggleStatus(u)}
              title={isSelf ? "Self deactivation disabled" : "Toggle Active Status"}
            />
            <Badge
              variant={u.active ? "default" : "secondary"}
              className={cn(
                "text-xs px-2 py-0.5 gap-1",
                u.active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              )}
            >
              {u.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
              {u.active ? "Active" : "Disabled"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: ({ row }: CellContext<IUser, unknown>) => {
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
      cell: ({ row }: CellContext<IUser, unknown>) => {
        const u = row.original;
        const userId = u.id || u._id || "";
        const isSelf = userId === loggedInUser?.id || u.email === loggedInUser?.email;

        return (
          <div className="flex items-center gap-2">
            {can("user:update") && (
              <Link
                href={`/users/${userId}/edit`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0 text-primary")}
                title="Edit User"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
            )}

            {can("user:delete") && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isSelf}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive disabled:opacity-30"
                onClick={() => handleDelete(userId, u.name)}
                title={isSelf ? "Cannot delete own account" : "Delete User"}
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
        title="User Management"
        description="Manage system users, assigned roles, and account access status."
      >
        {can("user:create") && (
          <Link
            href="/users/new"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
          >
            <Plus className="w-4 h-4" />
            Add New User
          </Link>
        )}
      </PageHeader>

      <DataTable
        columns={columns as ColumnDef<IUser>[]}
        data={usersList}
        isLoading={isLoading}
        error={error ? getErrorMessage(error, "Failed to load users list.") : null}
        onRetry={refetch}
        searchPlaceholder="Search users by name or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pageIndex={page}
        pageCount={(response as IApiResponse)?.meta?.pageCount || 1}
        onPageChange={setPage}
        emptyMessage="No users found."
      />
    </div>
  );
}
