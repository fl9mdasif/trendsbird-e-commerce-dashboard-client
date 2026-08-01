"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { MediaUploadBar } from "@/components/media/MediaUploadBar";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaList } from "@/components/media/MediaList";
import { MediaPreviewModal } from "@/components/media/MediaPreviewModal";
import { GridSkeleton, TableSkeleton } from "@/components/shared/Skeletons";
import {
  useGetAllMediaQuery,
  useUploadSingleMediaMutation,
  useUploadBulkMediaMutation,
  useDeleteMediaMutation,
} from "@/redux/api/mediaApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { showErrorToast } from "@/lib/utils";
import { UploadCloud, ImageIcon, Grid, List, Search, Loader2, HardDrive } from "lucide-react";
import { IMedia, IApiResponse } from "@/types/common";
import { filterMediaBySearch } from "./function.media";

export default function MediaPage() {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<IMedia | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all media
  const { data: response, isLoading, error, refetch } = useGetAllMediaQuery({
    page: 1,
    limit: 100,
  });

  const [uploadSingleMedia] = useUploadSingleMediaMutation();
  const [uploadBulkMedia] = useUploadBulkMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  const mediaList: IMedia[] = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as IApiResponse<IMedia[]>).data)) {
      return (response as IApiResponse<IMedia[]>).data;
    }
    return [];
  }, [response]);

  const filteredMedia = useMemo(() => {
    return filterMediaBySearch(mediaList, searchTerm);
  }, [mediaList, searchTerm]);

  // Simulate upload progress ticker
  const startProgressTicker = () => {
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? (clearInterval(interval), 90) : prev + Math.floor(Math.random() * 15 + 10)));
    }, 200);
    return interval;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const ticker = startProgressTicker();

    try {
      if (files.length === 1) {
        const formData = new FormData();
        formData.append("file", files[0]);
        await uploadSingleMedia(formData).unwrap();
        setUploadProgress(100);
        toast({ title: "Media Uploaded", description: `File '${files[0].name}' uploaded successfully.`, type: "success" });
      } else {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));
        await uploadBulkMedia(formData).unwrap();
        setUploadProgress(100);
        toast({ title: "Bulk Upload Complete", description: `${files.length} media files uploaded successfully.`, type: "success" });
      }
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to upload media.");
    } finally {
      clearInterval(ticker);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      e.target.value = "";
    }
  };

  const handleDeleteMedia = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete media '${name || "file"}'?`)) return;

    try {
      await deleteMedia(id).unwrap();
      toast({ title: "Media Deleted", description: "File permanently deleted from storage.", type: "success" });
      if (selectedMedia?.id === id) setSelectedMedia(null);
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete media.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Media Assets Library" description="Upload, manage, and inspect image storage assets.">
        <div className="flex items-center gap-3">
          {can("media:create") && (
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>{isUploading ? "Uploading..." : "Upload New Media"}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
            </label>
          )}

          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="gap-1.5 text-xs font-medium">
              <Grid className="w-3.5 h-3.5" /> Grid
            </Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="gap-1.5 text-xs font-medium">
              <List className="w-3.5 h-3.5" /> List
            </Button>
          </div>
        </div>
      </PageHeader>

      {isUploading && <MediaUploadBar progress={uploadProgress} />}

      {can("media:create") && !isUploading && (
        <label className="block relative border-2 border-dashed border-border hover:border-indigo-500/50 rounded-2xl p-6 bg-card/40 hover:bg-card/70 transition-all cursor-pointer text-center group">
          <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">Click or drag & drop images to upload</p>
            <p className="text-xs text-muted-foreground">Supports WEBP, PNG, JPG, SVG up to 10MB per file</p>
          </div>
        </label>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search media files by name..." className="pl-9" />
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 font-medium text-xs">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span>{filteredMedia.length} Files</span>
        </Badge>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <GridSkeleton count={12} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" />
        ) : (
          <TableSkeleton rows={6} />
        )
      ) : error ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card p-6">
          <p className="text-destructive font-medium text-sm">Failed to load media assets from server.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">Retry Loading</Button>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No media assets found.</p>
        </div>
      ) : viewMode === "grid" ? (
        <MediaGrid
          mediaList={filteredMedia}
          copiedId={copiedId}
          setCopiedId={setCopiedId}
          onSelect={setSelectedMedia}
          onDelete={handleDeleteMedia}
          canDelete={can("media:delete")}
        />
      ) : (
        <MediaList
          mediaList={filteredMedia}
          copiedId={copiedId}
          setCopiedId={setCopiedId}
          onSelect={setSelectedMedia}
          onDelete={handleDeleteMedia}
          canDelete={can("media:delete")}
        />
      )}

      {selectedMedia && (
        <MediaPreviewModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onDelete={handleDeleteMedia}
          setCopiedId={setCopiedId}
          canDelete={can("media:delete")}
        />
      )}
    </div>
  );
}
