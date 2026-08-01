"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { GridSkeleton } from "@/components/shared/Skeletons";
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
  Sparkles,
} from "lucide-react";
import { IAttribute, IAttributeValue, IApiResponse } from "@/types/common";

export default function AttributesPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");

  // Attribute Modal State
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<IAttribute | null>(null);
  const [attrName, setAttrName] = useState("");

  // Value Modal State
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<{
    attrId: string;
    val: IAttributeValue;
  } | null>(null);
  const [valueText, setValueText] = useState("");

  // Inline Add Value Input per Attribute Card
  const [inlineValueInput, setInlineValueInput] = useState<Record<string, string>>({});

  // Fetch Attributes from Server
  const { data: response, isLoading, error, refetch } = useGetAllAttributesQuery();

  const [createAttribute, { isLoading: isCreatingAttr }] = useCreateAttributeMutation();
  const [updateAttribute, { isLoading: isUpdatingAttr }] = useUpdateAttributeMutation();
  const [deleteAttribute] = useDeleteAttributeMutation();

  const [createAttributeValue, { isLoading: isCreatingVal }] = useCreateAttributeValueMutation();
  const [updateAttributeValue, { isLoading: isUpdatingVal }] = useUpdateAttributeValueMutation();
  const [deleteAttributeValue] = useDeleteAttributeValueMutation();

  const attributesList: IAttribute[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IAttribute[]>).data)) {
      return (response as IApiResponse<IAttribute[]>).data;
    }
    return [];
  }, [response]);

  const filteredAttributes = useMemo(() => {
    if (!searchTerm.trim()) return attributesList;
    const lower = searchTerm.toLowerCase().trim();
    return attributesList.filter(
      (attr) =>
        attr.name.toLowerCase().includes(lower) ||
        attr.values?.some((v) => v.value.toLowerCase().includes(lower))
    );
  }, [attributesList, searchTerm]);

  // Handle Attribute Modal Open
  const openCreateAttrModal = () => {
    setEditingAttr(null);
    setAttrName("");
    setIsAttrModalOpen(true);
  };

  const openEditAttrModal = (attr: IAttribute) => {
    setEditingAttr(attr);
    setAttrName(attr.name || "");
    setIsAttrModalOpen(true);
  };

  // Save Attribute
  const handleSaveAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName.trim()) return;

    try {
      if (editingAttr) {
        const id = editingAttr.id || editingAttr._id || "";
        await updateAttribute({ id, data: { name: attrName.trim() } }).unwrap();
        toast({ title: "Attribute Updated", description: `Attribute updated.`, type: "success" });
      } else {
        await createAttribute({ name: attrName.trim() }).unwrap();
        toast({ title: "Attribute Created", description: `Attribute created.`, type: "success" });
      }

      setIsAttrModalOpen(false);
      setAttrName("");
      setEditingAttr(null);
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to save attribute.");
    }
  };

  // Delete Attribute
  const handleDeleteAttribute = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete attribute '${name}'?`)) return;

    try {
      await deleteAttribute(id).unwrap();
      toast({ title: "Attribute Deleted", description: `Attribute '${name}' deleted.`, type: "success" });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete attribute.");
    }
  };

  // Handle Add Value Inline
  const handleAddInlineValue = async (attributeId: string) => {
    const valStr = inlineValueInput[attributeId]?.trim();
    if (!valStr) return;

    try {
      await createAttributeValue({ attributeId, data: { value: valStr }, value: valStr }).unwrap();
      toast({ title: "Value Added", description: `Option '${valStr}' added.`, type: "success" });
      setInlineValueInput((prev) => ({ ...prev, [attributeId]: "" }));
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to add attribute value.");
    }
  };

  // Open Edit Value Modal
  const openEditValueModal = (attrId: string, val: IAttributeValue) => {
    setEditingValue({ attrId, val });
    setValueText(val.value);
    setIsValueModalOpen(true);
  };

  // Save Value Edit
  const handleSaveValueEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingValue || !valueText.trim()) return;

    const valId = editingValue.val.id || editingValue.val._id || "";

    try {
      await updateAttributeValue({
        attributeId: editingValue.attrId,
        valueId: valId,
        data: { value: valueText.trim() },
        value: valueText.trim(),
      }).unwrap();

      toast({ title: "Option Updated", description: "Option value updated successfully.", type: "success" });
      setIsValueModalOpen(false);
      setEditingValue(null);
      setValueText("");
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to update option value.");
    }
  };

  // Delete Value
  const handleDeleteValue = async (attrId: string, valId: string, valStr: string) => {
    if (!window.confirm(`Delete option '${valStr}'?`)) return;

    try {
      await deleteAttributeValue({ attributeId: attrId, valueId: valId }).unwrap();
      toast({ title: "Option Deleted", description: `Option '${valStr}' deleted.`, type: "success" });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete option value.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attribute & Variant Options"
        description="Configure specifications like Size, Color, Storage, and RAM options."
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
            placeholder="Search attributes & options..."
            className="pl-9"
          />
        </div>

        <Badge variant="outline" className="gap-1.5 px-3 py-1 font-medium text-xs">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>{filteredAttributes.length} Attributes</span>
        </Badge>
      </div>

      {/* Grid of Attribute Cards */}
      {isLoading ? (
        <GridSkeleton count={6} cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" />
      ) : error ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card p-6">
          <p className="text-destructive font-medium text-sm">
            {getErrorMessage(error, "Failed to load attributes.")}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
            Retry Loading
          </Button>
        </div>
      ) : filteredAttributes.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
          <Sliders className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No attributes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAttributes.map((attr) => {
            const attrId = attr.id || attr._id || "";
            const values = attr.values || [];

            return (
              <div
                key={attrId}
                className="group relative p-5 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-indigo-500/30 transition-all space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{attr.name}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          {values.length} {values.length === 1 ? "option value" : "option values"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {can("attribute:update") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-primary"
                          onClick={() => openEditAttrModal(attr)}
                          title="Edit Attribute Name"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Attribute Values Pill Badges */}
                  <div className="py-3 flex flex-wrap gap-1.5 min-h-[50px] items-center">
                    {values.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">
                        No option values added yet.
                      </span>
                    ) : (
                      values.map((v) => {
                        const valId = v.id || v._id || "";
                        return (
                          <div
                            key={valId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold group/pill"
                          >
                            <span>{v.value}</span>
                            {can("attribute:update") && (
                              <button
                                type="button"
                                onClick={() => openEditValueModal(attrId, v)}
                                className="text-muted-foreground hover:text-primary transition-colors ml-0.5"
                                title="Edit Value"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                            {can("attribute:delete") && (
                              <button
                                type="button"
                                onClick={() => handleDeleteValue(attrId, valId, v.value)}
                                className="text-muted-foreground hover:text-rose-400 transition-colors"
                                title="Delete Value"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Inline Add Value Input */}
                {can("attribute:create") && (
                  <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                    <Input
                      placeholder="Add option (e.g. 256GB)..."
                      value={inlineValueInput[attrId] || ""}
                      onChange={(e) =>
                        setInlineValueInput((prev) => ({
                          ...prev,
                          [attrId]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInlineValue(attrId);
                        }
                      }}
                      className="h-8 text-xs bg-background/80"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddInlineValue(attrId)}
                      disabled={!inlineValueInput[attrId]?.trim() || isCreatingVal}
                      className="h-8 px-2.5 text-xs gap-1 shrink-0"
                    >
                      {isCreatingVal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Add
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Attribute Modal */}
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
                  placeholder="e.g. Mobile Storage Capacity, Color, Size"
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

      {/* Edit Option Value Modal */}
      {isValueModalOpen && editingValue && (
        <Dialog open={isValueModalOpen} onOpenChange={setIsValueModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>Edit Option Value</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveValueEdit} className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="valueText" className="font-semibold text-sm">
                  Option Value *
                </Label>
                <Input
                  id="valueText"
                  placeholder="e.g. 256GB, Red, XL"
                  value={valueText}
                  onChange={(e) => setValueText(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsValueModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdatingVal}
                  className="gap-1.5"
                >
                  {isUpdatingVal && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Option Value</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
