"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import CategoryForm from "@/components/categories/CategoryForm";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import {
  useGetSingleCategoryQuery,
  useUpdateCategoryMutation,
} from "@/redux/api/categoryApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { showErrorToast, getErrorMessage } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { ICategory, IApiResponse } from "@/types/common";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const { data: categoryResponse, isLoading, error, refetch } = useGetSingleCategoryQuery(categoryId);
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const categoryData: ICategory | null =
    (categoryResponse as IApiResponse<ICategory>)?.data ||
    (categoryResponse as unknown as ICategory) ||
    null;

  const handleUpdateCategory = async (data: { name: string; parentId?: string | null }) => {
    try {
      await updateCategory({
        id: categoryId,
        data: {
          name: data.name,
          parentId: data.parentId,
        },
      }).unwrap();

      toast({
        title: "Category Updated",
        description: `Category '${data.name}' updated successfully.`,
        type: "success",
      });

      router.push("/categories");
    } catch (err: unknown) {
      showErrorToast(err, "Failed to update category.");
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading category details..." />;
  if (error || !categoryData)
    return <ErrorState message={getErrorMessage(error, "Failed to load category.")} onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Edit Category: ${categoryData.name}`}
        description="Update category name and parent hierarchy position."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Button>
      </PageHeader>

      <CategoryForm
        initialData={categoryData}
        onSubmit={handleUpdateCategory}
        isLoading={isUpdating}
        title="Edit Category Details"
        description="Modify category information and click save to apply changes."
      />
    </div>
  );
}
