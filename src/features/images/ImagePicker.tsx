"use client";

import { useEffect, useState } from "react";
import { formatBytes, validateImageFile, FREE_MAX_SINGLE_BYTES, FREE_MAX_TOTAL_BYTES } from "@/lib/image-utils/validate";

type Props = {
  label?: string;
  totalUsedBytes?: number;
};

/** Preview-only picker. Does not upload or persist. */
export function ImagePicker({ label = "Profile photo (preview only)", totalUsedBytes = 0 }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
      <p className="font-medium">{label}</p>
      <p className="text-xs text-neutral-500">
        Not saved to the database. Max {formatBytes(FREE_MAX_SINGLE_BYTES)} each; family allowance{" "}
        {formatBytes(FREE_MAX_TOTAL_BYTES)}. Remaining ~{formatBytes(Math.max(0, FREE_MAX_TOTAL_BYTES - totalUsedBytes))}.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          if (!next) {
            setFile(null);
            setError(null);
            return;
          }
          const err = validateImageFile(next, { totalUsed: totalUsedBytes });
          if (err) {
            setError(err);
            setFile(null);
            return;
          }
          setError(null);
          setFile(next);
        }}
      />
      {file ? (
        <p className="text-xs text-neutral-600">
          {file.name} · {formatBytes(file.size)}
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="mt-2 h-24 w-24 rounded-md object-cover" />
      ) : null}
    </div>
  );
}
