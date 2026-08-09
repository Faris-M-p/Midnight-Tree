import { useRef } from "react";
import { Pencil } from "lucide-react";

interface ProfilePhotoPickerProps {
  previewUrl: string;
  onFileSelected: (file: File) => void;
}

export function ProfilePhotoPicker({ previewUrl, onFileSelected }: ProfilePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative h-20 w-20 shrink-0">
      <img src={previewUrl} alt="" className="h-20 w-20 rounded-xl border border-slate-800 object-cover" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-emerald-400 shadow hover:bg-slate-800"
        aria-label="Choose profile photo"
        title="Choose profile photo"
      >
        <Pencil size={14} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFileSelected(file);
        }}
      />
    </div>
  );
}
