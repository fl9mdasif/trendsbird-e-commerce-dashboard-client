import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "@/components/ui/toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts backend API error message from RTK Query / Axios / Fetch error objects
 */
export function getErrorMessage(err: unknown, fallbackMessage = "An unexpected error occurred."): string {
  if (!err) return fallbackMessage;

  if (typeof err === "string" && err.trim()) return err;

  if (typeof err === "object" && err !== null) {
    const errorObj = err as any;

    // 1. RTK Query payload: err.data.message
    if (errorObj.data && typeof errorObj.data === "object" && errorObj.data !== null) {
      if (typeof errorObj.data.message === "string" && errorObj.data.message.trim()) {
        return errorObj.data.message;
      }
      if (Array.isArray(errorObj.data.errorMessages) && errorObj.data.errorMessages.length > 0) {
        return errorObj.data.errorMessages.map((e: any) => e?.message || String(e)).join(", ");
      }
      if (typeof errorObj.data.error === "string" && errorObj.data.error.trim()) {
        return errorObj.data.error;
      }
    }

    // 2. Direct backend payload object: { success: false, message: "Insufficient permissions" }
    if (typeof errorObj.message === "string" && errorObj.message.trim()) {
      return errorObj.message;
    }

    // 3. String inside data property: err.data = "Forbidden"
    if (typeof errorObj.data === "string" && errorObj.data.trim()) {
      return errorObj.data;
    }

    // 4. Raw error string
    if (typeof errorObj.error === "string" && errorObj.error.trim()) {
      return errorObj.error;
    }
  }

  return fallbackMessage;
}

/**
 * Global Error Toast Handler — extracts backend message and displays error toast
 */
export function showErrorToast(err: unknown, fallbackTitle = "Action Failed") {
  const message = getErrorMessage(err, fallbackTitle);
  toast({
    title: message,
    description: message,
    type: "error",
  });
}
