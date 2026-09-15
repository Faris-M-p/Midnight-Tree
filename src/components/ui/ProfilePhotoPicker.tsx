import { useEffect, useRef, useState } from "react";
import { Pencil, User } from "lucide-react";

interface ProfilePhotoPickerProps {
  previewUrl: string;
  onFileSelected: (file: File) => void;
  sizeClassName?: string;
}

export function ProfilePhotoPicker({
  previewUrl,
  onFileSelected,
  sizeClassName = "h-20 w-20"
}: ProfilePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [previewUrl]);

  const showImage = Boolean(previewUrl) && !broken;

  return (
    <div className={`relative shrink-0 ${sizeClassName}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex ${sizeClassName} items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900`}
        aria-label="Choose profile photo"
        title="Choose profile photo"
      >
        {showImage ? (
          <img
            src={previewUrl}
            alt=""
            className={`h-full w-full object-cover ${sizeClassName}`}
            onError={() => setBroken(true)}
          />
        ) : (
          <User className="text-slate-500" size={28} />
        )}
      </button>
      <span className="pointer-events-none absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-emerald-400 shadow">
        <Pencil size={14} />
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
