"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileImage, Trash2, ExternalLink, Copy } from "lucide-react";
import { IMedia } from "@/types/common";
import { formatFileSize, handleCopyMediaUrl } from "@/app/(dashboard)/media/function.media";

interface MediaPreviewModalProps {
  media: IMedia | null;
  onClose: () => void;
  onDelete: (id: string, name?: string) => void;
  setCopiedId: (id: string | null) => void;
  canDelete: boolean;
}

export function MediaPreviewModal({
  media,
  onClose,
  onDelete,
  setCopiedId,
  canDelete,
}: MediaPreviewModalProps) {
  if (!media) return null;

  return (
    <Dialog open={Boolean(media)} onOpenChange={onClose}>
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
              src={media.url}
              alt={media.name || "Preview"}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Metadata Table */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border border-border">
            <div>
              <span className="text-muted-foreground block">File Name:</span>
              <span className="font-semibold text-foreground break-all">{media.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">File Size:</span>
              <span className="font-semibold text-foreground">{formatFileSize(media.sizeBytes || media.size)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">MIME Type:</span>
              <span className="font-semibold text-foreground">{media.mimeType}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Uploaded Date:</span>
              <span className="font-semibold text-foreground">
                {media.createdAt ? new Date(media.createdAt).toLocaleString() : "—"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(media.id || media._id || "", media.name)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete File
            </Button>
          )}

          <div className="flex items-center gap-2">
            <a
              href={media.url}
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
              onClick={() => handleCopyMediaUrl(media.url, media.id || media._id || "", setCopiedId)}
              className="gap-1.5"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MediaPreviewModal;
