import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { DatePicker } from "../DatePicker";
import { EmptyState, ErrorState, LoadingState } from "../ui/PageStates";
import { canEditFamily } from "../../auth/permissions";
import { navigateTo } from "../../routing/navigate";
import { ApiClientError } from "../../services/apiClient";
import {
  deleteMemoryImage,
  getMemory,
  memoryDateInputValue,
  setMemoryCover,
  updateMemory,
  uploadMemoryImage
} from "../../services/memoryService";
import type { MemoryDetail } from "../../types/memory";
import { MEMORY_MAX_IMAGES } from "../../types/memory";
import { formatBytes, memoryInputClass, memoryLabelClass, validateMemoryImage } from "../../utils/memoryImages";
import { notify } from "../../utils/notify";

interface MemoryEditViewProps {
  memoryId: number;
}

export function MemoryEditView({ memoryId }: MemoryEditViewProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ used: number; limit: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMemory(memoryId);
      setMemory(data);
      setTitle(data.title);
      setMemoryDate(memoryDateInputValue(data.memoryDate));
      setLocation(data.location ?? "");
      setDescription(data.description ?? "");
      setCoverPreview(data.coverUrl ?? "");
      setCoverFile(null);
    } catch (err) {
      setMemory(null);
      setError(err instanceof ApiClientError ? err.message : "Unable to load this memory.");
    } finally {
      setLoading(false);
    }
  }, [memoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (coverFile && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverFile, coverPreview]);

  if (!canEditFamily()) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-8 text-center text-sm text-slate-400">
          You do not have permission to edit memories.
        </p>
      </div>
    );
  }

  if (loading) return <LoadingState label="Loading memory…" />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!memory) return <EmptyState title="Memory not found" message="This memory is no longer available." />;

  const atMax = memory.images.length >= MEMORY_MAX_IMAGES;

  const chooseCover = (file: File) => {
    const validation = validateMemoryImage(file);
    if (validation) {
      notify.validation(validation);
      return;
    }
    setCoverPreview((current) => {
      if (coverFile && current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setCoverFile(file);
  };

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MEMORY_MAX_IMAGES - memory.images.length;
    if (remaining <= 0) {
      notify.validation("Maximum 10 images reached.");
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setProgress("Uploading photos…");
    try {
      for (let i = 0; i < selected.length; i += 1) {
        const validation = validateMemoryImage(selected[i]);
        if (validation) {
          notify.validation(validation);
          continue;
        }
        setProgress(`Uploading ${i + 1} of ${selected.length}…`);
        const result = await uploadMemoryImage(memory.id, selected[i]);
        setStorageInfo({ used: result.storageUsedBytes, limit: result.storageLimitBytes });
      }
      notify.success("Photos added.");
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to upload photos.");
    } finally {
      setProgress(null);
    }
  };

  const confirmDeleteImage = async () => {
    if (deleteImageId == null) return;
    setDeletingImage(true);
    try {
      const result = await deleteMemoryImage(memory.id, deleteImageId);
      setStorageInfo({ used: result.storageUsedBytes, limit: result.storageLimitBytes });
      notify.success("Photo deleted.");
      setDeleteImageId(null);
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to delete photo.");
    } finally {
      setDeletingImage(false);
    }
  };

  const handleSetCover = async (mediaId: number) => {
    try {
      setProgress("Updating cover…");
      await setMemoryCover(memory.id, mediaId);
      notify.success("Cover updated.");
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to update cover.");
    } finally {
      setProgress(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      notify.validation("Title is required.");
      return;
    }
    if (!memoryDate) {
      notify.validation("Date is required.");
      return;
    }
    if (!description.trim()) {
      notify.validation("Description is required.");
      return;
    }

    setSaving(true);
    setProgress("Saving memory…");
    try {
      await updateMemory(memory.id, {
        title: title.trim(),
        description: description.trim(),
        memoryDate: new Date(`${memoryDate}T12:00:00`).toISOString(),
        location: location.trim() || undefined,
        coverImage: coverFile
      });
      notify.success("Memory updated.");
      navigateTo(`/memories/${memory.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to update memory.");
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <form className="mx-auto max-w-3xl space-y-5 p-4 md:p-6" onSubmit={(e) => void handleSubmit(e)}>
      <div>
        <button
          type="button"
          onClick={() => navigateTo(`/memories/${memory.id}`)}
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          ← Back to memory
        </button>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">Edit Memory</h1>
      </div>

      <label className={memoryLabelClass}>
        Title *
        <input className={`${memoryInputClass} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={memoryLabelClass}>
          Date *
          <div className="mt-1">
            <DatePicker value={memoryDate} onChange={setMemoryDate} max="2100-12-31" placeholder="Select date" />
          </div>
        </label>
        <label className={memoryLabelClass}>
          Location
          <input className={`${memoryInputClass} mt-1`} value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} />
        </label>
      </div>

      <label className={memoryLabelClass}>
        Description *
        <textarea className={`${memoryInputClass} mt-1`} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </label>

      <div>
        <p className={memoryLabelClass}>Cover</p>
        <input
          ref={coverInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) chooseCover(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="mt-2 w-full overflow-hidden rounded-2xl border border-dashed border-slate-700 bg-slate-950/60"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="" className="h-44 w-full object-cover" />
          ) : (
            <div className="flex h-36 items-center justify-center gap-2 text-sm text-slate-400">
              <ImagePlus size={18} /> Choose cover image
            </div>
          )}
        </button>
        <p className="mt-1 text-xs text-slate-500">Upload a new cover, or set cover from an existing photo below.</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={memoryLabelClass}>
            Photos ({memory.images.length}/{MEMORY_MAX_IMAGES})
          </p>
          <input
            ref={photosInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleAddPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={atMax || Boolean(progress)}
            onClick={() => photosInputRef.current?.click()}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-40"
          >
            Add images
          </button>
        </div>
        {atMax && <p className="text-xs text-amber-300/90">Maximum 10 images reached.</p>}
        {storageInfo && (
          <p className="text-xs text-slate-500">
            Storage used {formatBytes(storageInfo.used)}
            {storageInfo.limit > 0 ? ` of ${formatBytes(storageInfo.limit)}` : ""}
          </p>
        )}

        {memory.images.length === 0 ? (
          <EmptyState title="No photos" message="Add images to this memory." />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {memory.images.map((image) => (
              <div key={image.id} className="relative overflow-hidden rounded-xl border border-slate-800">
                <img src={image.fileUrl || ""} alt="" className="aspect-square w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/80 to-transparent p-2">
                  {!image.isCover && (
                    <button
                      type="button"
                      onClick={() => void handleSetCover(image.id)}
                      className="rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold text-slate-950"
                    >
                      Set cover
                    </button>
                  )}
                  {image.isCover && (
                    <span className="rounded-md bg-slate-100/90 px-2 py-1 text-[10px] font-semibold text-slate-900">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteImageId(image.id)}
                    className="ml-auto rounded-md border border-rose-500/40 bg-slate-950/70 p-1 text-rose-300"
                    aria-label="Delete image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {progress && (
        <p className="inline-flex items-center gap-2 text-sm text-emerald-300">
          <Loader2 size={14} className="animate-spin" /> {progress}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Save changes
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => navigateTo(`/memories/${memory.id}`)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-4 py-2 text-sm disabled:opacity-60"
        >
          <X size={14} /> Cancel
        </button>
      </div>

      <ConfirmDialog
        open={deleteImageId != null}
        title="Delete photo?"
        message="This photo will be removed and storage usage will be updated."
        confirmLabel="Delete Photo"
        loading={deletingImage}
        onCancel={() => setDeleteImageId(null)}
        onConfirm={() => void confirmDeleteImage()}
      />
    </form>
  );
}
