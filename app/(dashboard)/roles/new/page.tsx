"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import RoleForm from "@/components/roles/RoleForm";
import { useCreateRoleMutation, useAssignPermissionMutation } from "@/redux/api/roleApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { showErrorToast } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function CreateRolePage() {
  const router = useRouter();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [assignPermission] = useAssignPermissionMutation();

  const handleCreateRole = async (data: {
    name: string;
    description: string;
    permissions: string[];
    permissionIds?: string[];
  }) => {
    try {
      // 1. Create Role (POST /roles)
      const roleRes: any = await createRole({
        name: data.name,
        description: data.description,
      }).unwrap();

      const createdRole = roleRes?.data || roleRes;
      const roleId = createdRole?.id || createdRole?._id;

      // 2. Assign each selected permission (POST /roles/:id/permissions)
      if (roleId && Array.isArray(data.permissionIds) && data.permissionIds.length > 0) {
        await Promise.all(
          data.permissionIds.map((pId) =>
            assignPermission({ roleId, permissionId: pId }).unwrap().catch(() => null)
          )
        );
      }

      toast({
        title: "Role Created",
        description: `Role '${data.name}' created with ${data.permissionIds?.length || 0} permissions.`,
        type: "success",
      });

      router.push("/roles");
    } catch (err: unknown) {
      showErrorToast(err, "Failed to create role.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Create New Role"
        description="Configure a new role and grant module-level permissions using the matrix grid."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </PageHeader>

      <RoleForm
        onSubmit={handleCreateRole}
        isLoading={isCreating}
        title="Role Information"
        description="Define role metadata and assign module permissions below."
      />
    </div>
  );
}
