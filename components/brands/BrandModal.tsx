"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Loader2 } from "lucide-react";
import { IBrand } from "@/types/common";

interface BrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBrand?: IBrand | null;
  onSubmit: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export function BrandModal({
  open,
  onOpenChange,
  initialBrand,
  onSubmit,
  isLoading = false,
}: BrandModalProps) {
  const [brandName, setBrandName] = useState(initialBrand?.name || "");

  useEffect(() => {
    setBrandName(initialBrand?.name || "");
  }, [initialBrand, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    await onSubmit(brandName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-500" />
            <span>{initialBrand ? "Edit Brand" : "Create New Brand"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="brandName" className="font-semibold text-sm">
              Brand Name *
            </Label>
            <Input
              id="brandName"
              placeholder="e.g. Samsung, Apple, Nike"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !brandName.trim()}
              className="gap-1.5"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialBrand ? "Update Brand" : "Create Brand"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BrandModal;
