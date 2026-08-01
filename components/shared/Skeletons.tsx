"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface GridSkeletonProps {
  count?: number;
  cols?: string;
}

/**
 * Reusable Grid Cards Skeleton Loader
 */
export function GridSkeleton({
  count = 6,
  cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
}: GridSkeletonProps) {
  return (
    <div className={`grid ${cols}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-border bg-card/60 space-y-4 animate-pulse min-h-[100px]"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl bg-muted/60 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4 bg-muted/60 rounded" />
              <Skeleton className="h-3 w-1/2 bg-muted/40 rounded" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Skeleton className="h-4 w-20 bg-muted/60 rounded" />
            <Skeleton className="h-7 w-16 bg-muted/40 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Reusable Table Rows Skeleton Loader
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-9 h-9 rounded-lg bg-muted/60 shrink-0" />
            <div className="space-y-1.5 flex-1 max-w-sm">
              <Skeleton className="h-4 w-3/4 bg-muted/60 rounded" />
              <Skeleton className="h-3 w-1/2 bg-muted/40 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 bg-muted/50 rounded-full" />
          <Skeleton className="h-8 w-16 bg-muted/40 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * Reusable Category Tree Skeleton Loader
 */
export function TreeSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-5 h-5 rounded bg-muted/60" />
            <Skeleton className="w-8 h-8 rounded-lg bg-muted/60" />
            <Skeleton className="h-4 w-40 bg-muted/60 rounded" />
          </div>
          <Skeleton className="h-7 w-20 bg-muted/40 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
