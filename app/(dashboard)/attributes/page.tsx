"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import {
  useGetAllAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
} from "@/redux/api/attributeApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { showErrorToast, getErrorMessage } from "@/lib/utils";
import {
  Plus,
  Edit3,
  Trash2,
  Sliders,
  Search,
  Loader2,
  X,
  Check,
  Tag,
  Layers,
} from "lucide-react";
import { IAttribute, IAttributeValue, IApiResponse } from "@/types/common";

export default function AttributesPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");

  // Attribute Modal State
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<IAttribute | null>(null);
  const [attrName, setAttrName] = useState("");

  // Inline Value Add State (key: attributeId -> string)
  const [newValuesMap, setNewValuesMap] = useState<Record<string, string>>({});
  const [addingValueAttrId, setAddingValueAttrId] = useState<string | null>(null);

  // Edit Value Modal State
  const [editingValueObj, setEditingValueObj] = useState<{
    attributeId: string;
    value: IAttributeValue;
  } | null>(null);
  const [editValueText, setEditValueText] = useState("");

  // Fetch Attributes from Server
  const { data: response, isLoading, error, refetch } = useGetAllAttributesQuery({
    search: searchTerm,
    page: 1,
    limit: 50,
  });

  const [createAttribute, { isLoading: isCreatingAttr }] = useCreateAttributeMutation();
  const [updateAttribute, { isLoading: isUpdatingAttr }] = useUpdateAttributeMutation();
  const [deleteAttribute] = useDeleteAttributeMutation();

  const [createAttributeValue, { isLoading: isCreatingValue }] = useCreateAttributeValueMutation();
  const [updateAttributeValue, { isLoading: isUpdatingValue }] = useUpdateAttributeValueMutation();
  const [deleteAttributeValue] = useDeleteAttributeValueMutation();

  const attributesList: IAttribute[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IAttribute[]>).data)) {
      return (response as IApiResponse<IAttribute[]>).data;
    }
    return [];
  }, [response]);

  // Open Create Main Attribute Modal
  const openCreateAttrModal = () => {
    setEditingAttr(null);
    setAttrName("");
    setIsAttrModalOpen(true);
  };

  // Open Edit Main Attribute Modal
  const openEditAttrModal = (attr: IAttribute) => {
    setEditingAttr(attr);
    setAttrName(attr.name || "");
    setIsAttrModalOpen(true);
  };

  // Save Main Attribute (Create or Edit)
  const handleSaveAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName.trim()) {
      toast({
        title: "Validation Error",
        description: "Attribute name is required.",
        type: "error",
      });
      return;
    }

    try {
      if (editingAttr) {
        const attrId = editingAttr.id || editingAttr._id || "";
        await updateAttribute({
          id: attrId,
          data: { name: attrName.trim() },
        }).unwrap();

        toast({
          title: "Attribute Updated",
          description: `Attribute '${attrName}' updated successfully.`,
          type: "success",
        });
      } else {
        await createAttribute({ name: attrName.trim() }).unwrap();

        toast({
          title: "Attribute Created",
          description: `Attribute '${attrName}' created successfully.`,
          type: "success",
        });
      }

      setIsAttrModalOpen(false);
      setAttrName("");
      setEditingAttr(null);
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to save attribute.");
    }
  };

  // Delete Main Attribute
  const handleDeleteAttribute = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete attribute '${name}' and all its values?`)) return;

    try {
      await deleteAttribute(id).unwrap();
      toast({
        title: "Attribute Deleted",
        description: `Attribute '${name}' deleted successfully.`,
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete attribute.");
    }
  };

  // Inline Add Value Handler (POST /attributes/:id/values)
  const handleAddValue = async (attributeId: string) => {
    const valText = (newValuesMap[attributeId] || "").trim();
    if (!valText) return;

    setAddingValueAttrId(attributeId);
    try {
      await createAttributeValue({
        attributeId,
        data: { value: valText },
      }).unwrap();

      toast({
        title: "Value Added",
        description: `Value '${valText}' added to attribute.`,
        type: "success",
      });

      setNewValuesMap((prev) => ({ ...prev, [attributeId]: "" }));
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to add attribute value.");
    } finally {
      setAddingValueAttrId(null);
    }
  };

  // Open Edit Value Modal
  const openEditValueModal = (attributeId: string, valueObj: IAttributeValue) => {
    setEditingValueObj({ attributeId, value: valueObj });
    setEditValueText(valueObj.value || "");
  };

  // Save Edit Value Handler (PATCH /attributes/:id/values/:vid)
  const handleSaveValueEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingValueObj || !editValueText.trim()) return;

    const { attributeId, value } = editingValueObj;
    const valueId = value.id || value._id || "";

    try {
      await updateAttributeValue({
        attributeId,
        valueId,
        data: { value: editValueText.trim() },
      }).unwrap();

      toast({
        title: "Value Updated",
        description: `Attribute value updated to '${editValueText}'.`,
        type: "success",
      });

      setEditingValueObj(null);
      setEditValueText("");
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to update attribute value.");
    }
  };

  // Delete Attribute Value Handler (DELETE /attributes/:id/values/:vid)
  const handleDeleteValue = async (attributeId: string, valueId: string, valName: string) => {
    if (!window.confirm(`Remove value '${valName}'?`)) return;

    try {
      await deleteAttributeValue({ attributeId, valueId }).unwrap();
      toast({
        title: "Value Removed",
        description: `Value '${valName}' deleted.`,
        type: "info",
      });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete attribute value.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Attributes & Options"
        description="Manage product specification attributes (e.g. Size, Color, Capacity) and nested values."
      >
        {can("attribute:create") && (
          <Button onClick={openCreateAttrModal} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Attribute
          </Button>
        )}
      </PageHeader>

      {/* Search Input Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search attributes..."
            className="pl-9"
          />
        </div>

        <Badge variant="outline" className="gap-1.5 px-3 py-1 font-medium text-xs">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>{attributesList.length} Attributes</span>
        </Badge>
      </div>

      {/* Attributes Content View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading product attributes from server...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card p-6">
          <p className="text-destructive font-medium text-sm">
            {getErrorMessage(error, "Failed to load attributes.")}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
            Retry Loading
          </Button>
        </div>
      ) : attributesList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
          <Sliders className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No attributes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {attributesList.map((attr) => {
            const attrId = attr.id || attr._id || "";
            const values = attr.values || [];
            const isAddingValue = addingValueAttrId === attrId;

            return (
              <div
                key={attrId}
                className="p-5 rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                {/* Header: Attribute Title & Actions */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-base capitalize">
                        {attr.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {values.length} {values.length === 1 ? "value option" : "value options"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {can("attribute:update") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-primary"
                        onClick={() => openEditAttrModal(attr)}
                        title="Edit Attribute Name"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    {can("attribute:delete") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteAttribute(attrId, attr.name)}
                        title="Delete Attribute"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Values List Container */}
                <div className="space-y-2 flex-1">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Option Values:
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {values.map((v) => {
                      const vId = v.id || v._id || "";
                      return (
                        <div
                          key={vId}
                          className="group/val inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium transition-all"
                        >
                          <Tag className="w-3 h-3 text-indigo-400" />
                          <span>{v.value}</span>

                          {can("attribute:update") && (
                            <button
                              type="button"
                              onClick={() => openEditValueModal(attrId, v)}
                              className="opacity-0 group-hover/val:opacity-100 hover:text-indigo-200 transition-opacity ml-1"
                              title="Edit Value"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}

                          {can("attribute:update") && (
                            <button
                              type="button"
                              onClick={() => handleDeleteValue(attrId, vId, v.value)}
                              className="opacity-0 group-hover/val:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity"
                              title="Delete Value"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {values.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">
                        No values added yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Add Value Input */}
                {can("attribute:update") && (
                  <div className="pt-3 border-t border-border flex items-center gap-2">
                    <Input
                      value={newValuesMap[attrId] || ""}
                      onChange={(e) =>
                        setNewValuesMap((prev) => ({
                          ...prev,
                          [attrId]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddValue(attrId);
                        }
                      }}
                      placeholder="Add value (e.g. 256GB)..."
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={isAddingValue || !(newValuesMap[attrId] || "").trim()}
                      onClick={() => handleAddValue(attrId)}
                      className="h-8 px-3 text-xs gap-1"
                    >
                      {isAddingValue ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Add Option</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Attribute Create/Edit Modal Dialog */}
      {isAttrModalOpen && (
        <Dialog open={isAttrModalOpen} onOpenChange={setIsAttrModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <span>{editingAttr ? "Edit Attribute" : "Create New Attribute"}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveAttribute} className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="attrName" className="font-semibold text-sm">
                  Attribute Name *
                </Label>
                <Input
                  id="attrName"
                  placeholder="e.g. Storage Capacity, Color, Size"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAttrModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreatingAttr || isUpdatingAttr}
                  className="gap-1.5"
                >
                  {(isCreatingAttr || isUpdatingAttr) && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingAttr ? "Update Attribute" : "Create Attribute"}</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Attribute Value Edit Modal Dialog */}
      {editingValueObj && (
        <Dialog open={Boolean(editingValueObj)} onOpenChange={() => setEditingValueObj(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                <span>Edit Option Value</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveValueEdit} className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="editValText" className="font-semibold text-sm">
                  Option Value *
                </Label>
                <Input
                  id="editValText"
                  placeholder="e.g. 512GB, Red, XL"
                  value={editValueText}
                  onChange={(e) => setEditValueText(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingValueObj(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdatingValue}
                  className="gap-1.5"
                >
                  {isUpdatingValue && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Value</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
