import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { DatePicker } from "../DatePicker";
import { canEditFamily } from "../../auth/permissions";
import { navigateTo } from "../../routing/navigate";
import { ApiClientError } from "../../services/apiClient";
import { createMemory } from "../../services/memoryService";
import { MEMORY_MAX_IMAGES } from "../../types/memory";
import { memoryInputClass, memoryLabelClass, validateMemoryImage } from "../../utils/memoryImages";
import { notify } from "../../utils/notify";
import { useActionLock } from "../../hooks/useActionLock";

interface LocalPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

export function MemoryCreateView() {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const { isBusy, run } = useActionLock();

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalImages = useMemo(() => (coverFile ? 1 : 0) + photos.length, [coverFile, photos.length]);

  if (!canEditFamily()) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-8 text-center text-sm text-slate-400">
          You do not have permission to create memories.
        </p>
      </div>
    );
  }

  const setCover = (file: File) => {
    const error = validateMemoryImage(file);
    if (error) {
      notify.validation(error);
      return;
    }
    setCoverPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setCoverFile(file);
  };

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MEMORY_MAX_IMAGES - totalImages;
    if (remaining <= 0) {
      notify.validation("A memory can have at most 10 images.");
      return;
    }

    const next: LocalPhoto[] = [];
    for (const file of Array.from(files)) {
      if (next.length >= remaining) {
        notify.validation("A memory can have at most 10 images.");
        break;
      }
      const error = validateMemoryImage(file);
      if (error) {
        notify.validation(error);
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }
    if (next.length) setPhotos((prev) => [...prev, ...next]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
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
    if (!coverFile) {
      notify.validation("Cover image is required.");
      return;
    }
    if (totalImages > MEMORY_MAX_IMAGES) {
      notify.validation("A memory can have at most 10 images.");
      return;
    }

    await run(async () => {
      try {
        const created = await createMemory({
          title: title.trim(),
          description: description.trim(),
          memoryDate: new Date(`${memoryDate}T12:00:00`).toISOString(),
          location: location.trim() || undefined,
          coverImage: coverFile,
          images: photos.map((photo) => photo.file)
        });

        notify.success("Memory created successfully.");
        navigateTo(`/memories/${created.id}`);
      } catch (error) {
        if (error instanceof ApiClientError) notify.fromApiError(error);
        else notify.error("Unable to create memory right now.");
      }
    });
  };

  return (
    <form className="mx-auto max-w-3xl space-y-5 p-4 md:p-6" onSubmit={(e) => void handleSubmit(e)}>
      <div>
        <button type="button" onClick={() => navigateTo("/memories")} className="text-xs text-emerald-400 hover:text-emerald-300">
          ← Back to Memories
        </button>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">Create Memory</h1>
        <p className="mt-1 text-sm text-slate-400">Capture a special family moment.</p>
      </div>

      <label className={memoryLabelClass}>
        Title *
        <input
          className={`${memoryInputClass} mt-1`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
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
          <input
            className={`${memoryInputClass} mt-1`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={200}
            placeholder="Optional"
          />
        </label>
      </div>

      <label className={memoryLabelClass}>
        Description *
        <textarea
          className={`${memoryInputClass} mt-1`}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>

      <div>
        <p className={memoryLabelClass}>Cover Image *</p>
        <input
          ref={coverInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setCover(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="mt-2 flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-8 text-sm text-slate-400 hover:border-emerald-500/50"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="" className="h-44 w-full rounded-xl object-cover" />
          ) : (
            <>
              <ImagePlus size={22} />
              Choose cover image
            </>
          )}
        </button>
        <p className="mt-1 text-xs text-slate-500">JPG, JPEG, PNG, or WEBP · max 10 MB</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className={memoryLabelClass}>Photos</p>
          <p className="text-xs text-slate-400">
            {totalImages} / {MEMORY_MAX_IMAGES} images
          </p>
        </div>
        <input
          ref={photosInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={totalImages >= MEMORY_MAX_IMAGES || isBusy}
          onClick={() => photosInputRef.current?.click()}
          className="mt-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 disabled:opacity-40"
        >
          Add photos
        </button>
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative overflow-hidden rounded-xl border border-slate-800">
                <img src={photo.previewUrl} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-overlay p-1 text-slate-200"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          Create Memory
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => navigateTo("/memories")}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
