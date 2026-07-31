"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import ProductForm from "@/components/products/ProductForm";
import { useCreateProductMutation } from "@/redux/api/productApi";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { showErrorToast } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { ICreateProductInput } from "@/types/common";

export default function CreateProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleCreateProduct = async (data: ICreateProductInput) => {
    try {
      await createProduct(data).unwrap();

      toast({
        title: "Product Created",
        description: `Product '${data.name}' created successfully.`,
        type: "success",
      });

      router.push("/products");
    } catch (err: unknown) {
      showErrorToast(err, "Failed to create product.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Create New Product"
        description="Add a new catalog product with simple pricing or variable options matrix."
      >
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>
      </PageHeader>

      <ProductForm onSubmit={handleCreateProduct} isLoading={isLoading} />
    </div>
  );
}
