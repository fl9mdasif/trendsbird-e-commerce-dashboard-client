"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import RoleForm from "@/components/roles/RoleForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import {
  useGetSingleRoleQuery,
  useUpdateRoleMutation,
  useAssignPermissionMutation,
  useRemovePermissionMutation,
} from "@/redux/api/roleApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { showErrorToast, getErrorMessage } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;

  const { data: roleResponse, isLoading, error, refetch } = useGetSingleRoleQuery(roleId);
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [assignPermission] = useAssignPermissionMutation();
  const [removePermission] = useRemovePermissionMutation();

  const roleData: any = (roleResponse as any)?.data || roleResponse;

  const handleUpdateRole = async (data: {
    name: string;
    description: string;
    permissions: string[];
    permissionIds?: string[];
  }) => {
    try {
      // 1. Update basic role metadata (PATCH /roles/:id)
      await updateRole({
        id: roleId,
        data: { name: data.name, description: data.description },
      }).unwrap();

      // 2. Diff existing permissions vs target permissionIds
      const existingPermissions = roleData?.permissions || [];
      const existingPermissionIds: string[] = existingPermissions
        .map((rp: any) => rp?.permissionId || rp?.permission?.id || rp?.id)
        .filter(Boolean);

      const targetPermissionIds: string[] = data.permissionIds || [];

      const toAdd = targetPermissionIds.filter((pId) => !existingPermissionIds.includes(pId));
      const toRemove = existingPermissionIds.filter((pId) => !targetPermissionIds.includes(pId));

      // 3. Assign new permissions (POST /roles/:id/permissions)
      if (toAdd.length > 0) {
        await Promise.all(
          toAdd.map((pId) =>
            assignPermission({ roleId, permissionId: pId }).unwrap().catch(() => null)
          )
        );
      }

      // 4. Remove revoked permissions (DELETE /roles/:id/permissions/:pid)
      if (toRemove.length > 0) {
        await Promise.all(
          toRemove.map((pId) =>
            removePermission({ roleId, permissionId: pId }).unwrap().catch(() => null)
          )
        );
      }

      toast({
        title: "Role Updated",
        description: `Role '${data.name}' permissions updated successfully.`,
        type: "success",
      });

      router.push("/roles");
    } catch (err: unknown) {
      showErrorToast(err, "Failed to update role.");
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading role details..." />;
  if (error || !roleData)
    return <ErrorState message={getErrorMessage(error, "Failed to load role information.")} onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={`Edit Role: ${roleData?.name || "Role"}`}
        description="Update role name, description, and permission matrix assignments."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </PageHeader>

      <RoleForm
        initialData={roleData}
        onSubmit={handleUpdateRole}
        isLoading={isUpdating}
        title="Edit Role Details"
        description="Modify role permissions and click save to apply changes."
      />
    </div>
  );
}
