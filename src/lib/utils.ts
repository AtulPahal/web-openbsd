import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Dispatch a GNOME-style desktop notification. Listened by Desktop. */
export function showNotification(message: string, duration = 2500): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("show-notification", { detail: { message, duration } })
  );
}
