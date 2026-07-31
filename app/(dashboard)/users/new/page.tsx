"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import UserForm from "@/components/users/UserForm";
import { useCreateUserMutation } from "@/redux/api/userApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const handleCreateUser = async (formData: {
    name: string;
    email: string;
    password?: string;
    roleId: string;
    active: boolean;
  }) => {
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password || "",
        roleId: formData.roleId,
        active: formData.active,
      }).unwrap();

      toast({
        title: "User Created",
        description: `User '${formData.name}' created successfully.`,
        type: "success",
      });

      router.push("/users");
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err, "Failed to create new user.");
      toast({
        title: errMsg,
        description: errMsg,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create New System User"
        description="Add a new administrator or manager to access the dashboard."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
      </PageHeader>

      <UserForm
        onSubmit={handleCreateUser}
        isLoading={isLoading}
        isEditMode={false}
        title="Account & Role Information"
        description="Fill out user credentials and select their system access role."
      />
    </div>
  );
}
