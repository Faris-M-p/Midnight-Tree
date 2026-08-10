import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { updateFamilyCover } from "../../services/familyService";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface ChangeCoverModalProps {
  open: boolean;
  currentCoverUrl: string;
  onClose: () => void;
  onSaved: (coverUrl: string) => void;
}

function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function ChangeCoverModal({ open, currentCoverUrl, onClose, onSaved }: ChangeCoverModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      setSaving(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  const displayUrl = previewUrl || currentCoverUrl;

  const handleFileSelected = (next: File) => {
    if (!isAcceptedImage(next)) {
      notify.validation("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (next.size > MAX_BYTES) {
      notify.validation("Image must be 5 MB or smaller.");
      return;
    }
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(next);
    });
    setFile(next);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      notify.validation("Choose a cover image before saving.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateFamilyCover(file);
      const coverUrl = updated.coverUrl?.trim() || previewUrl;
      notify.success("Cover image updated.");
      onSaved(coverUrl);
      onClose();
    } catch (error) {
      if (error instanceof ApiClientError) notify.fromApiError(error);
      else notify.error("Unable to update the cover image right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} disabled={saving} />
      <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto border border-slate-800 bg-slate-950 shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
          <h2 className="text-base font-semibold text-slate-100">Change cover</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-900 disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <form className="space-y-4 p-4 sm:p-5" onSubmit={(e) => void handleSave(e)}>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div
              className="h-36 w-full bg-cover bg-center sm:h-44"
              style={{ backgroundImage: `url(${displayUrl})` }}
              role="img"
              aria-label="Cover preview"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-xs leading-relaxed text-slate-400">
            <p className="font-medium text-slate-300">Recommended cover</p>
            <p className="mt-1">
              Landscape image about <span className="text-slate-200">1600×600 px</span> (roughly 8:3 / 21:9). JPG, PNG, or
              WebP · max 5 MB.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={saving}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-60"
            >
              <ImagePlus size={16} />
              {file ? "Choose another image" : "Choose Image"}
            </button>
            {file && (
              <p className="truncate text-xs text-slate-500" title={file.name}>
                {file.name}
              </p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(event) => {
                const next = event.target.files?.[0];
                event.target.value = "";
                if (next) handleFileSelected(next);
              }}
            />
          </div>

          {previewUrl && (
            <p className="text-xs text-emerald-400/90">New cover selected — preview above. Save to apply.</p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !file}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save Cover"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
