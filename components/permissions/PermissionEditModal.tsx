"use client";

import React, { useState } from "react";
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
import { Shield, Loader2 } from "lucide-react";
import { IPermission } from "@/types/common";

interface PermissionEditModalProps {
  permission: IPermission | null;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  isLoading?: boolean;
}

export function PermissionEditModal({
  permission,
  onClose,
  onSubmit,
  isLoading = false,
}: PermissionEditModalProps) {
  const [prevPermission, setPrevPermission] = useState(permission);
  const [name, setName] = useState(permission?.name || "");
  const [description, setDescription] = useState(permission?.description || "");

  // Sync state during render when permission prop changes (React recommended pattern)
  if (prevPermission !== permission) {
    setPrevPermission(permission);
    setName(permission?.name || "");
    setDescription(permission?.description || "");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), description: description.trim() });
  };

  if (!permission) return null;

  return (
    <Dialog open={Boolean(permission)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Edit Permission</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="editName" className="font-semibold text-sm">
              Permission Identifier *
            </Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. test, report:read"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDescription" className="font-semibold text-sm">
              Description
            </Label>
            <Input
              id="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief permission description..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading || !name.trim()} className="gap-1.5">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PermissionEditModal;
