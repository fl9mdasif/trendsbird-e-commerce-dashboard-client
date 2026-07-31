"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import {
  useGetSingleProductQuery,
  useUpdateProductMutation,
} from "@/redux/api/productApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { showErrorToast, getErrorMessage } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ICreateProductInput, IProduct, IApiResponse } from "@/types/common";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || "";

  const { data: response, isLoading: isFetching, error } = useGetSingleProductQuery(productId, {
    skip: !productId,
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const productData: IProduct | null =
    (response as IApiResponse<IProduct>)?.data || (response as unknown as IProduct) || null;

  const handleUpdateProduct = async (data: ICreateProductInput) => {
    if (!productId) return;

    try {
      await updateProduct({
        id: productId,
        data,
      }).unwrap();

      toast({
        title: "Product Updated",
        description: `Product '${data.name}' updated successfully.`,
        type: "success",
      });

      router.push("/products");
    } catch (err: unknown) {
      showErrorToast(err, "Failed to update product.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Edit Product"
        description="Update e-commerce product details, categories, pricing, or variant matrix."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>
      </PageHeader>

      {isFetching ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading product details...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card p-6">
          <p className="text-destructive font-medium text-sm">
            {getErrorMessage(error, "Failed to load product details.")}
          </p>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="mt-3">
            Go Back
          </Button>
        </div>
      ) : (
        <ProductForm
          initialData={productData}
          onSubmit={handleUpdateProduct}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}
