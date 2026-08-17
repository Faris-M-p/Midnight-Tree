import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { MemoryLightbox } from "./MemoryLightbox";
import { EmptyState, ErrorState, LoadingState } from "../ui/PageStates";
import { canEditFamily } from "../../auth/permissions";
import { navigateTo } from "../../routing/navigate";
import { ApiClientError } from "../../services/apiClient";
import {
  deleteMemory,
  deleteMemoryImage,
  formatMemoryDate,
  getMemory,
  uploadMemoryImage
} from "../../services/memoryService";
import type { MemoryDetail } from "../../types/memory";
import { MEMORY_MAX_IMAGES } from "../../types/memory";
import { formatBytes, validateMemoryImage } from "../../utils/memoryImages";
import { notify } from "../../utils/notify";

interface MemoryDetailsViewProps {
  memoryId: number;
}

export function MemoryDetailsView({ memoryId }: MemoryDetailsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteMemoryOpen, setDeleteMemoryOpen] = useState(false);
  const [deletingMemory, setDeletingMemory] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ used: number; limit: number } | null>(null);

  const canWrite = canEditFamily();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMemory(memoryId);
      setMemory(data);
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

  const images = useMemo(
    () =>
      (memory?.images ?? [])
        .filter((img) => Boolean(img.fileUrl))
        .map((img) => ({ id: img.id, url: img.fileUrl!, alt: memory?.title })),
    [memory]
  );

  const handleAddPhotos = async (files: FileList | null) => {
    if (!memory || !files?.length) return;
    const remaining = MEMORY_MAX_IMAGES - memory.images.length;
    if (remaining <= 0) {
      notify.validation("Maximum 10 images reached.");
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      for (let i = 0; i < selected.length; i += 1) {
        const file = selected[i];
        const validation = validateMemoryImage(file);
        if (validation) {
          notify.validation(validation);
          continue;
        }
        setUploadProgress(`Uploading ${i + 1} of ${selected.length}…`);
        const result = await uploadMemoryImage(memory.id, file);
        setStorageInfo({ used: result.storageUsedBytes, limit: result.storageLimitBytes });
      }
      notify.success("Photos uploaded.");
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to upload photos right now.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const confirmDeleteImage = async () => {
    if (!memory || deleteImageId == null) return;
    setDeletingImage(true);
    try {
      const result = await deleteMemoryImage(memory.id, deleteImageId);
      setStorageInfo({ used: result.storageUsedBytes, limit: result.storageLimitBytes });
      notify.success("Photo deleted.");
      setDeleteImageId(null);
      await load();
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to delete this photo.");
    } finally {
      setDeletingImage(false);
    }
  };

  const confirmDeleteMemory = async () => {
    if (!memory) return;
    setDeletingMemory(true);
    try {
      await deleteMemory(memory.id);
      notify.success("Memory deleted.");
      navigateTo("/memories");
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to delete this memory.");
      setDeletingMemory(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
        <div className="aspect-[21/9] animate-pulse rounded-2xl bg-slate-800" />
        <LoadingState label="Loading memory…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <ErrorState message={error} onRetry={() => void load()} />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <EmptyState title="Memory not found" message="This memory is no longer available." />
      </div>
    );
  }

  const meta = [formatMemoryDate(memory.memoryDate), memory.location?.trim()].filter(Boolean).join(" • ");
  const atMax = memory.images.length >= MEMORY_MAX_IMAGES;

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigateTo("/memories")}
        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
      >
        <ArrowLeft size={14} /> Back to Memories
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        {memory.coverUrl ? (
          <img src={memory.coverUrl} alt="" className="aspect-[21/9] w-full object-cover" />
        ) : (
          <div className="flex aspect-[21/9] items-center justify-center text-slate-600">
            <ImagePlus size={32} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{memory.title}</h1>
          {meta && <p className="mt-1 text-sm text-slate-400">{meta}</p>}
        </div>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigateTo(`/memories/${memory.id}/edit`)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              type="button"
              onClick={() => setDeleteMemoryOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300 hover:bg-rose-950/30"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {memory.description?.trim() && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{memory.description}</p>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Photos ({memory.images.length}/{MEMORY_MAX_IMAGES})
          </h2>
          {canWrite && (
            <>
              <input
                ref={fileInputRef}
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
                disabled={atMax || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm disabled:opacity-40"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                Add Photos
              </button>
            </>
          )}
        </div>

        {atMax && canWrite && <p className="text-xs text-amber-300/90">Maximum 10 images reached.</p>}
        {uploadProgress && (
          <p className="inline-flex items-center gap-2 text-xs text-emerald-300">
            <Loader2 size={12} className="animate-spin" /> {uploadProgress}
          </p>
        )}
        {storageInfo && (
          <p className="text-xs text-slate-500">
            Storage used {formatBytes(storageInfo.used)}
            {storageInfo.limit > 0 ? ` of ${formatBytes(storageInfo.limit)}` : ""}
          </p>
        )}

        {images.length === 0 ? (
          <EmptyState title="No photos yet" message="Add photos to this memory to see them here." />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {memory.images.map((image) => {
              const lightboxIndexForImage = images.findIndex((item) => item.id === image.id);
              return (
              <div key={image.id} className="group relative overflow-hidden rounded-xl border border-slate-800">
                <button
                  type="button"
                  className="block w-full"
                  onClick={() => {
                    if (lightboxIndexForImage >= 0) setLightboxIndex(lightboxIndexForImage);
                  }}
                >
                  <img
                    src={image.fileUrl || ""}
                    alt=""
                    className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
                  />
                </button>
                {image.isCover && (
                  <span className="absolute left-2 top-2 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-950">
                    Cover
                  </span>
                )}
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => setDeleteImageId(image.id)}
                    className="absolute right-2 top-2 rounded-md border border-rose-500/40 bg-slate-950/80 p-1 text-rose-300 opacity-0 transition group-hover:opacity-100"
                    aria-label="Delete photo"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex != null && (
        <MemoryLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}

      <ConfirmDialog
        open={deleteMemoryOpen}
        title="Delete memory?"
        message="This memory will be cancelled and hidden from your family list."
        confirmLabel="Delete Memory"
        loading={deletingMemory}
        onCancel={() => setDeleteMemoryOpen(false)}
        onConfirm={() => void confirmDeleteMemory()}
      />

      <ConfirmDialog
        open={deleteImageId != null}
        title="Delete photo?"
        message="This photo will be removed from the memory and storage usage will be updated."
        confirmLabel="Delete Photo"
        loading={deletingImage}
        onCancel={() => setDeleteImageId(null)}
        onConfirm={() => void confirmDeleteImage()}
      />
    </div>
  );
}
