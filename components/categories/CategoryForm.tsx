"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { toast } from "@/components/ui/toast";
import { Loader2, Save, FolderTree, ArrowLeft } from "lucide-react";
import { ICategory, IApiResponse } from "@/types/common";

interface CategoryFormProps {
  initialData?: ICategory | null;
  defaultParentId?: string | null;
  onSubmit: (data: { name: string; parentId?: string | null }) => Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export default function CategoryForm({
  initialData,
  defaultParentId,
  onSubmit,
  isLoading = false,
  title = "Category Details",
  description = "Fill out category metadata and select an optional parent category for hierarchy.",
}: CategoryFormProps) {
  const router = useRouter();
  const currentCategoryId = initialData?.id || initialData?._id;

  const [name, setName] = useState(initialData?.name || "");
  const [parentId, setParentId] = useState<string>(
    initialData?.parentId || defaultParentId || ""
  );

  // Fetch flat categories list for Parent Category Selector
  const { data: categoriesRes } = useGetAllCategoriesQuery();
  const allCategories: ICategory[] =
    (categoriesRes as IApiResponse<ICategory[]>)?.data ||
    (categoriesRes as unknown as ICategory[]) ||
    [];

  // Filter out self when editing to avoid circular parenting
  const validParentCategories = allCategories.filter(
    (c) => (c.id || c._id) !== currentCategoryId
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setParentId(initialData.parentId || "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        type: "error",
      });
      return;
    }

    await onSubmit({
      name: name.trim(),
      parentId: parentId && parentId !== "none" ? parentId : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-500" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Category Name Input */}
          <div className="space-y-2">
            <Label htmlFor="categoryName" className="font-semibold text-sm">
              Category Name *
            </Label>
            <Input
              id="categoryName"
              placeholder="e.g. Electronics, Laptops, Smartwatches"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Parent Category Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="parentCategory" className="font-semibold text-sm">
              Parent Category (Optional)
            </Label>
            <select
              id="parentCategory"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">None (Top Level Root Category)</option>
              {validParentCategories.map((cat) => {
                const catId = cat.id || cat._id || "";
                return (
                  <option key={catId} value={catId}>
                    {cat.name}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-muted-foreground">
              Select a parent category to create a subcategory tree hierarchy.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
