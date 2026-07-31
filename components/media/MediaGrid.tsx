"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Check, Trash2 } from "lucide-react";
import { IMedia } from "@/types/common";
import { formatFileSize, handleCopyMediaUrl } from "@/app/(dashboard)/media/function.media";

interface MediaGridProps {
  mediaList: IMedia[];
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
  onSelect: (media: IMedia) => void;
  onDelete: (id: string, name?: string) => void;
  canDelete: boolean;
}

export function MediaGrid({
  mediaList,
  copiedId,
  setCopiedId,
  onSelect,
  onDelete,
  canDelete,
}: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {mediaList.map((media) => {
        const mediaId = media.id || media._id || "";
        const displayUrl = media.thumbnailUrl || media.url;
        const sizeText = formatFileSize(media.sizeBytes || media.size);

        return (
          <div
            key={mediaId}
            className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
            onClick={() => onSelect(media)}
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

                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(mediaId, media.name);
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
                <span className="uppercase">{media.mimeType ? media.mimeType.split("/")[1] : "IMG"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MediaGrid;
