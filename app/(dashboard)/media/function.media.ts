import { toast } from "@/components/ui/toast";
import { IMedia } from "@/types/common";

/**
 * Format raw bytes into human-readable B, KB, MB, or GB strings
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Filter media list by search keyword
 */
export function filterMediaBySearch(mediaList: IMedia[], searchTerm: string): IMedia[] {
  if (!searchTerm.trim()) return mediaList;
  const term = searchTerm.toLowerCase().trim();
  return mediaList.filter((m) =>
    (m.name || m.filename || "").toLowerCase().includes(term)
  );
}

/**
 * Copy image direct URL to clipboard and show toast
 */
export function handleCopyMediaUrl(
  url: string,
  id: string,
  setCopiedId: (id: string | null) => void
): void {
  navigator.clipboard.writeText(url);
  setCopiedId(id);
  toast({
    title: "URL Copied",
    description: "Direct image URL copied to clipboard.",
    type: "info",
  });
  setTimeout(() => setCopiedId(null), 2000);
}
