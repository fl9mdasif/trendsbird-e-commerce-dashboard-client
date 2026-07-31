"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Check, Trash2 } from "lucide-react";
import { IMedia } from "@/types/common";
import { formatFileSize, handleCopyMediaUrl } from "@/app/(dashboard)/media/function.media";

interface MediaListProps {
  mediaList: IMedia[];
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
  onSelect: (media: IMedia) => void;
  onDelete: (id: string, name?: string) => void;
  canDelete: boolean;
}

export function MediaList({
  mediaList,
  copiedId,
  setCopiedId,
  onSelect,
  onDelete,
  canDelete,
}: MediaListProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="divide-y divide-border">
        {mediaList.map((media) => {
          const mediaId = media.id || media._id || "";
          const displayUrl = media.thumbnailUrl || media.url;

          return (
            <div
              key={mediaId}
              className="flex items-center justify-between p-3 hover:bg-accent/40 transition-colors"
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => onSelect(media)}
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
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(mediaId, media.name)}
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
  );
}

export default MediaList;
