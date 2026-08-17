import { MEMORY_ACCEPTED_EXTENSIONS, MEMORY_ACCEPTED_TYPES, MEMORY_MAX_IMAGE_BYTES } from "../types/memory";

export function isAcceptedMemoryImage(file: File): boolean {
  if (MEMORY_ACCEPTED_TYPES.has(file.type.toLowerCase())) return true;
  const name = file.name.toLowerCase();
  return MEMORY_ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function validateMemoryImage(file: File): string | null {
  if (!isAcceptedMemoryImage(file)) {
    return "Please choose a JPG, JPEG, PNG, or WEBP image.";
  }
  if (file.size > MEMORY_MAX_IMAGE_BYTES) {
    return "Image must be 10 MB or smaller.";
  }
  if (file.size <= 0) {
    return "Please choose an image.";
  }
  return null;
}

export const memoryInputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

export const memoryLabelClass = "block text-sm text-slate-300";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
