"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import UserForm from "@/components/users/UserForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { useGetSingleUserQuery, useUpdateUserMutation } from "@/redux/api/userApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { IUser, IApiResponse } from "@/types/common";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: userResponse, isLoading, error, refetch } = useGetSingleUserQuery(userId);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const userData: IUser | null = (userResponse as IApiResponse<IUser>)?.data || (userResponse as unknown as IUser) || null;

  const handleUpdateUser = async (formData: {
    name: string;
    email: string;
    password?: string;
    roleId: string;
    active: boolean;
  }) => {
    try {
      await updateUser({
        id: userId,
        data: {
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
          active: formData.active,
        },
      }).unwrap();

      toast({
        title: "User Updated",
        description: `User '${formData.name}' profile updated successfully.`,
        type: "success",
      });

      router.push("/users");
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err, "Failed to update user profile.");
      toast({
        title: errMsg,
        description: errMsg,
        type: "error",
      });
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading user details..." />;
  if (error || !userData)
    return <ErrorState message={getErrorMessage(error, "Failed to load user profile.")} onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Edit User: ${userData.name}`}
        description="Update account details, role permissions, and active status."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          Back to Users
        </Button>
      </PageHeader>

      <UserForm
        initialData={userData}
        onSubmit={handleUpdateUser}
        isLoading={isUpdating}
        isEditMode={true}
        title="Modify User Details"
        description="Edit user info and click save to apply changes."
      />
    </div>
  );
}
