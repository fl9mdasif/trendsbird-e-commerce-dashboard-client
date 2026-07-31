"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useGetAllMediaQuery,
  useUploadSingleMediaMutation,
  useUploadBulkMediaMutation,
} from "@/redux/api/mediaApi";
import { toast } from "@/components/ui/toast";
import { showErrorToast, cn } from "@/lib/utils";
import {
  UploadCloud,
  ImageIcon,
  Check,
  Search,
  Loader2,
  HardDrive,
} from "lucide-react";
import { IMedia, IApiResponse } from "@/types/common";

interface MediaLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selectedMedia: IMedia[]) => void;
  multiple?: boolean;
  selectedIds?: string[];
  title?: string;
}

export default function MediaLibraryModal({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = "Select Media Assets",
}: MediaLibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedIds);
  const [isUploading, setIsUploading] = useState(false);

  const { data: response, isLoading, refetch } = useGetAllMediaQuery({
    page: 1,
    limit: 100,
  });

  const [uploadSingleMedia] = useUploadSingleMediaMutation();
  const [uploadBulkMedia] = useUploadBulkMediaMutation();

  const mediaList: IMedia[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IMedia[]>).data)) {
      return (response as IApiResponse<IMedia[]>).data;
    }
    return [];
  }, [response]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) =>
      (m.name || m.filename || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mediaList, searchTerm]);

  // Sync selectedIds prop on open
  React.useEffect(() => {
    if (open) {
      setSelectedItems(selectedIds);
    }
  }, [open, selectedIds]);

  const toggleSelect = (media: IMedia) => {
    const id = media.id || media._id || "";
    if (multiple) {
      if (selectedItems.includes(id)) {
        setSelectedItems((prev) => prev.filter((i) => i !== id));
      } else {
        setSelectedItems((prev) => [...prev, id]);
      }
    } else {
      setSelectedItems([id]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (files.length === 1) {
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await uploadSingleMedia(formData).unwrap();
        const uploadedMedia = (res as any)?.data || res;
        const newId = uploadedMedia?.id || uploadedMedia?._id;
        if (newId) {
          setSelectedItems((prev) => (multiple ? [...prev, newId] : [newId]));
        }
      } else {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        const res = await uploadBulkMedia(formData).unwrap();
        const uploadedList: IMedia[] = (res as any)?.data || res || [];
        const newIds = uploadedList.map((m) => m.id || m._id).filter(Boolean) as string[];
        if (newIds.length > 0) {
          setSelectedItems((prev) => (multiple ? [...prev, ...newIds] : [newIds[0]]));
        }
      }
      toast({
        title: "Media Uploaded",
        description: "Uploaded media files selected automatically.",
        type: "success",
      });
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to upload media.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirm = () => {
    const chosenObjects = mediaList.filter((m) =>
      selectedItems.includes(m.id || m._id || "")
    );
    onSelect(chosenObjects);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <ImageIcon className="w-5 h-5 text-indigo-500" />
            <span>{title}</span>
            <Badge variant="secondary" className="ml-auto font-medium text-xs">
              {selectedItems.length} Selected
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar: Search and Upload */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 border-b border-border">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search images by name..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all shrink-0">
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            <span>{isUploading ? "Uploading..." : "Upload New"}</span>
            <input
              type="file"
              multiple={multiple}
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Media Grid Container */}
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar min-h-[300px] max-h-[450px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>Loading media library...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <HardDrive className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs">No matching media files found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filteredMedia.map((media) => {
                const mediaId = media.id || media._id || "";
                const isSelected = selectedItems.includes(mediaId);
                const displayUrl = media.thumbnailUrl || media.url;

                return (
                  <div
                    key={mediaId}
                    onClick={() => toggleSelect(media)}
                    className={cn(
                      "group relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all bg-slate-950/40",
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-md scale-95"
                        : "border-border hover:border-indigo-500/40"
                    )}
                  >
                    <Image
                      src={displayUrl}
                      alt={media.name || "Media"}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Selection Overlay Checkmark */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <div className="p-1.5 rounded-full bg-indigo-600 text-white shadow-md">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white truncate font-medium">
                      {media.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            className="gap-2"
          >
            Confirm Selection ({selectedItems.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
