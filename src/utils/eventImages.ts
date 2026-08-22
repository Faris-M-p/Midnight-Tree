export const EVENT_ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]);

export const EVENT_ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const EVENT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function isAcceptedEventImage(file: File): boolean {
  if (EVENT_ACCEPTED_TYPES.has(file.type.toLowerCase())) return true;
  const name = file.name.toLowerCase();
  return EVENT_ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function validateEventImage(file: File): string | null {
  if (!isAcceptedEventImage(file)) {
    return "Please choose a JPG, JPEG, PNG, or WEBP image.";
  }
  if (file.size > EVENT_MAX_IMAGE_BYTES) {
    return "Image must be 10 MB or smaller.";
  }
  if (file.size <= 0) {
    return "Please choose an image.";
  }
  return null;
}

export const eventInputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

export const eventLabelClass = "block text-sm text-slate-300";
