"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import CategoryForm from "@/components/categories/CategoryForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useCreateCategoryMutation } from "@/redux/api/categoryApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { showErrorToast } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

function CreateCategoryFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultParentId = searchParams.get("parentId") || null;

  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleCreateCategory = async (data: { name: string; parentId?: string | null }) => {
    try {
      await createCategory({
        name: data.name,
        parentId: data.parentId,
      }).unwrap();

      toast({
        title: "Category Created",
        description: `Category '${data.name}' created successfully.`,
        type: "success",
      });

      router.push("/categories");
    } catch (err: unknown) {
      showErrorToast(err, "Failed to create category.");
    }
  };

  return (
    <CategoryForm
      defaultParentId={defaultParentId}
      onSubmit={handleCreateCategory}
      isLoading={isLoading}
      title="Category Hierarchy Setup"
      description="Create a root category or select a parent to form a subcategory tree."
    />
  );
}

export default function CreateCategoryPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create New Category"
        description="Add a new catalog category or subcategory to organize products."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Button>
      </PageHeader>

      <Suspense fallback={<LoadingSpinner text="Loading category form..." />}>
        <CreateCategoryFormWrapper />
      </Suspense>
    </div>
  );
}
