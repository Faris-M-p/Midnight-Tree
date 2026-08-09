import { useEffect, useState, type FormEvent } from "react";
import { Camera, Pencil } from "lucide-react";
import { mockFamily, type MockFamily } from "../../data/mockFamily";
import { setFamilyBranding } from "../../data/familyBranding";
import { canEdit } from "../../auth/permissions";
import { navigateTo, matchPath } from "../../routing/navigate";
import { ProfilePhotoPicker } from "../../components/ui/ProfilePhotoPicker";
import { getFamily, updateFamily } from "../../services/familyService";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";

interface FamilyPageProps {
  pathname: string;
}

export function FamilyPage({ pathname }: FamilyPageProps) {
  const isEdit = Boolean(matchPath("/family/edit", pathname));
  const [draft, setDraft] = useState<MockFamily>({ ...mockFamily });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFamily()
      .then((family) => {
        const logo = family.photoUrl || mockFamily.logo;
        setFamilyBranding({
          name: family.familyName || mockFamily.name,
          code: family.familyCode || mockFamily.code,
          logo
        });
        setDraft((current) => ({
          ...current,
          name: family.familyName || current.name,
          code: family.familyCode || current.code,
          description: family.description || current.description,
          logo
        }));
      })
      .catch(() => {
        setDraft({ ...mockFamily });
      });
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify.validation("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.validation("Image must be 5 MB or smaller.");
      return;
    }
    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setPhotoFile(file);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      notify.validation("Family name is required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateFamily(
        {
          familyName: draft.name.trim(),
          description: draft.description,
          photoUrl: draft.logo
        },
        photoFile
      );
      const logo = updated.photoUrl || photoPreview || draft.logo;
      Object.assign(mockFamily, draft, { logo, name: updated.familyName || draft.name });
      setFamilyBranding({
        name: mockFamily.name,
        code: mockFamily.code,
        logo
      });
      notify.success("Family details saved successfully.");
      navigateTo("/family");
    } catch (error) {
      if (error instanceof ApiClientError) notify.fromApiError(error);
      else notify.error("Unable to save family details right now.");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit) {
    const preview = photoPreview || draft.logo || mockFamily.logo;

    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit family</h2>
          <button type="button" onClick={() => navigateTo("/family")} className="text-sm text-slate-400 hover:text-slate-200">
            Cancel
          </button>
        </div>
        <form className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5" onSubmit={(e) => void handleSave(e)}>
          <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <ProfilePhotoPicker previewUrl={preview} onFileSelected={handlePhotoSelected} sizeClassName="h-24 w-24" />
            <div>
              <p className="text-sm font-medium text-slate-100">Family photo</p>
              <p className="mt-1 text-xs text-slate-500">Tap the pen to choose a family photo. It is saved with the family.</p>
            </div>
          </div>

          {(
            [
              ["name", "Family name"],
              ["code", "Family code"],
              ["origin", "Origin"],
              ["location", "Location"]
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block space-y-1 text-sm">
              <span className="text-slate-300">{label}</span>
              <input
                value={String(draft[key])}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
              />
            </label>
          ))}
          <label className="block space-y-1 text-sm">
            <span className="text-slate-300">Description</span>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-slate-300">Family history</span>
            <textarea
              rows={5}
              value={draft.history}
              onChange={(e) => setDraft((d) => ({ ...d, history: e.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div className="relative h-44 bg-cover bg-center md:h-56" style={{ backgroundImage: `url(${draft.cover || mockFamily.cover})` }}>
          {canEdit() && (
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200"
            >
              <Camera size={12} /> Change cover
            </button>
          )}
        </div>
        <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative -mt-14">
              <img src={draft.logo || mockFamily.logo} alt="" className="h-24 w-24 rounded-2xl border-4 border-slate-900 object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400">{draft.code}</p>
              <h2 className="text-2xl font-semibold text-slate-100">{draft.name}</h2>
              <p className="text-sm text-slate-400">{draft.location}</p>
            </div>
          </div>
          {canEdit() && (
            <button
              type="button"
              onClick={() => navigateTo("/family/edit")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-emerald-500 hover:text-emerald-300"
            >
              <Pencil size={14} /> Edit family
            </button>
          )}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Description</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">{draft.description}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Origin</h3>
          <p className="mt-2 text-sm text-slate-200">{draft.origin}</p>
          <p className="mt-2 text-xs text-slate-500">Founded {draft.foundedYear}</p>
        </article>
      </section>

      <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Family history</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{draft.history}</p>
      </article>
    </div>
  );
}
