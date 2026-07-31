"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import PageHeader from "@/components/shared/PageHeader";
import {
  useGetAllMediaQuery,
  useUploadSingleMediaMutation,
  useUploadBulkMediaMutation,
  useDeleteMediaMutation,
} from "@/redux/api/mediaApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "@/components/ui/toast";
import { showErrorToast } from "@/lib/utils";
import {
  UploadCloud,
  ImageIcon,
  Trash2,
  Copy,
  Check,
  Grid,
  List,
  Search,
  ExternalLink,
  Loader2,
  HardDrive,
  FileImage,
} from "lucide-react";
import { IMedia, IApiResponse } from "@/types/common";
import {
  formatFileSize,
  filterMediaBySearch,
  handleCopyMediaUrl,
} from "./function.media";

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

  // Filter media using separate function module
  const filteredMedia = useMemo(() => {
    return filterMediaBySearch(mediaList, searchTerm);
  }, [mediaList, searchTerm]);

  // Simulate smooth upload progress bar ticker
  const startProgressTicker = () => {
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15 + 10);
      });
    }, 200);
    return interval;
  };

  // Handle File Upload (Single or Bulk)
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
        toast({
          title: "Media Uploaded",
          description: `File '${files[0].name}' uploaded successfully.`,
          type: "success",
        });
      } else {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
        await uploadBulkMedia(formData).unwrap();
        setUploadProgress(100);
        toast({
          title: "Bulk Upload Complete",
          description: `${files.length} media files uploaded successfully.`,
          type: "success",
        });
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

  // Handle Delete Media
  const handleDeleteMedia = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete media '${name || "file"}'?`)) return;

    try {
      await deleteMedia(id).unwrap();
      toast({
        title: "Media Deleted",
        description: "File permanently deleted from storage.",
        type: "success",
      });
      if (selectedMedia?.id === id) setSelectedMedia(null);
      refetch();
    } catch (err: unknown) {
      showErrorToast(err, "Failed to delete media.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Assets Library"
        description="Upload, manage, and inspect image storage assets."
      >
        <div className="flex items-center gap-3">
          {/* Upload Button Input */}
          {can("media:create") && (
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              <span>{isUploading ? "Uploading..." : "Upload New Media"}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-1.5 text-xs font-medium"
            >
              <Grid className="w-3.5 h-3.5" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-1.5 text-xs font-medium"
            >
              <List className="w-3.5 h-3.5" />
              List
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Uploading Progress Bar Card */}
      {isUploading && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2 text-indigo-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Uploading media to Supabase cloud storage...</span>
            </span>
            <span className="text-indigo-400 font-mono font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-indigo-500/20">
            <div
              className="bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag and Drop Zone Card */}
      {can("media:create") && !isUploading && (
        <label className="block relative border-2 border-dashed border-border hover:border-indigo-500/50 rounded-2xl p-6 bg-card/40 hover:bg-card/70 transition-all cursor-pointer text-center group">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Click or drag & drop images to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Supports WEBP, PNG, JPG, SVG up to 10MB per file
            </p>
          </div>
        </label>
      )}

      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search media files by name..."
            className="pl-9"
          />
        </div>

        <Badge variant="outline" className="gap-1.5 px-3 py-1 font-medium text-xs">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span>{filteredMedia.length} Files</span>
        </Badge>
      </div>

      {/* Media Content View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading media assets library...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card p-6">
          <p className="text-destructive font-medium text-sm">Failed to load media assets from server.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
            Retry Loading
          </Button>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/40 space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No media assets found.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((media) => {
            const mediaId = media.id || media._id || "";
            const displayUrl = media.thumbnailUrl || media.url;
            const sizeText = formatFileSize(media.sizeBytes || media.size);

            return (
              <div
                key={mediaId}
                className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
                onClick={() => setSelectedMedia(media)}
              >
                {/* Thumbnail Image Container */}
                <div className="relative aspect-square w-full bg-slate-950/40 flex items-center justify-center overflow-hidden">
                  <Image
                    src={displayUrl}
                    alt={media.name || "Media"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />

                  {/* High Contrast Background Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5 p-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyMediaUrl(media.url, mediaId, setCopiedId);
                      }}
                      className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/40 transition-transform hover:scale-110 active:scale-95 flex items-center gap-1 text-xs font-semibold"
                      title="Copy Image URL"
                    >
                      {copiedId === mediaId ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {can("media:delete") && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMedia(mediaId, media.name);
                        }}
                        className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/40 transition-transform hover:scale-110 active:scale-95 flex items-center gap-1 text-xs font-semibold"
                        title="Delete Media"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-2.5 space-y-0.5 bg-card border-t border-border">
                  <p className="text-xs font-semibold text-foreground truncate" title={media.name}>
                    {media.name || media.filename || "Untitled"}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{sizeText}</span>
                    <span className="uppercase">{media.mimeType.split("/")[1] || "IMG"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="divide-y divide-border">
            {filteredMedia.map((media) => {
              const mediaId = media.id || media._id || "";
              const displayUrl = media.thumbnailUrl || media.url;

              return (
                <div
                  key={mediaId}
                  className="flex items-center justify-between p-3 hover:bg-accent/40 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => setSelectedMedia(media)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden relative shrink-0">
                      <Image
                        src={displayUrl}
                        alt={media.name || "Media"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {media.name || media.filename}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{formatFileSize(media.sizeBytes || media.size)}</span>
                        <span>•</span>
                        <span>{media.mimeType}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyMediaUrl(media.url, mediaId, setCopiedId)}
                      className="gap-1.5 text-xs"
                    >
                      {copiedId === mediaId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy URL
                    </Button>
                    {can("media:delete") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMedia(mediaId, media.name)}
                        className="text-destructive hover:text-destructive text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Media Inspector Preview Dialog */}
      {selectedMedia && (
        <Dialog open={Boolean(selectedMedia)} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-indigo-500" />
                <span>Media Details</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Full Image Preview */}
              <div className="relative aspect-video w-full rounded-xl bg-slate-950/60 overflow-hidden flex items-center justify-center border border-border">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.name || "Preview"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Metadata Table */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block">File Name:</span>
                  <span className="font-semibold text-foreground break-all">{selectedMedia.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">File Size:</span>
                  <span className="font-semibold text-foreground">{formatFileSize(selectedMedia.sizeBytes || selectedMedia.size)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">MIME Type:</span>
                  <span className="font-semibold text-foreground">{selectedMedia.mimeType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Uploaded Date:</span>
                  <span className="font-semibold text-foreground">
                    {selectedMedia.createdAt ? new Date(selectedMedia.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              {can("media:delete") && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteMedia(selectedMedia.id, selectedMedia.name)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete File
                </Button>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Original
                </a>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCopyMediaUrl(selectedMedia.url, selectedMedia.id, setCopiedId)}
                  className="gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  Copy URL
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
