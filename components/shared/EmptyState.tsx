import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  message = "There are no items to display at the moment.",
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-card/50 my-4 gap-3",
        className
      )}
    >
      <div className="p-3 rounded-full bg-muted text-muted-foreground">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
