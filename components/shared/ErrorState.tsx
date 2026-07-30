import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5 my-4 gap-3 text-destructive",
        className
      )}
    >
      <div className="p-3 rounded-full bg-destructive/10">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-2 gap-2">
          <RotateCcw className="w-4 h-4" />
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
