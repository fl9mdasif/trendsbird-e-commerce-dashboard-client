import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 32,
  text = "Loading...",
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 w-full min-h-[200px] text-muted-foreground gap-3",
        className
      )}
    >
      <Loader2 className="animate-spin text-primary" size={size} />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
