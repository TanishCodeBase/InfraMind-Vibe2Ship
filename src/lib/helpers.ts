import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import type { Timestamp } from "firebase/firestore";

// ─── Tailwind class merger (shadcn/ui standard) ───────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Firebase Timestamp utilities ─────────────────────────────────────────────

export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

export function formatTimestamp(
  timestamp: Timestamp,
  pattern = "dd MMM yyyy, hh:mm a"
): string {
  return format(timestamp.toDate(), pattern);
}

export function timeAgo(timestamp: Timestamp): string {
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
}

// ─── String utilities ─────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function formatCategoryLabel(category: string): string {
  return category
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

// ─── Number utilities ─────────────────────────────────────────────────────────

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ─── Validation utilities ─────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\+?[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ""));
}

export function isValidPinCode(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

// ─── File utilities ───────────────────────────────────────────────────────────

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function generateStoragePath(
  basePath: string,
  userId: string,
  filename: string
): string {
  const ext = getFileExtension(filename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${basePath}/${userId}/${timestamp}_${random}.${ext}`;
}

// ─── Geo utilities ────────────────────────────────────────────────────────────

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ─── Error normalisation ──────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

// ─── API response builders ────────────────────────────────────────────────────

export function buildSuccessResponse<T>(data: T, message?: string) {
  return { success: true as const, data, ...(message ? { message } : {}) };
}

export function buildErrorResponse(code: string, message: string, details?: unknown) {
  return { success: false as const, error: { code, message, details } };
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}
