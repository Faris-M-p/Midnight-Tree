/**
 * Local image selection helpers — no upload / no DB persistence.
 */

export const FREE_MAX_SINGLE_BYTES = 2 * 1024 * 1024;
export const FREE_MAX_TOTAL_BYTES = 100 * 1024 * 1024;

const ACCEPTED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateImageFile(
  file: File,
  opts?: { maxSingle?: number; totalUsed?: number; totalMax?: number }
): string | null {
  const maxSingle = opts?.maxSingle ?? FREE_MAX_SINGLE_BYTES;
  const totalMax = opts?.totalMax ?? FREE_MAX_TOTAL_BYTES;
  const totalUsed = opts?.totalUsed ?? 0;

  if (!ACCEPTED.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    return "Use JPG, PNG, or WEBP.";
  }
  if (file.size > maxSingle) {
    return `Image must be ${formatBytes(maxSingle)} or smaller.`;
  }
  if (totalUsed + file.size > totalMax) {
    return `Family image allowance is ${formatBytes(totalMax)}.`;
  }
  return null;
}

export type ImageStorageAdapter = {
  /** Future R2 upload. Today: returns null and keeps preview local only. */
  persist(_familyId: string, _file: File): Promise<string | null>;
};

export const noopImageStorage: ImageStorageAdapter = {
  async persist() {
    return null;
  }
};
