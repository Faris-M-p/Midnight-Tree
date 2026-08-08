import { useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { mockFamily, type MockFamily } from "../../data/mockFamily";
import { canEdit } from "../../auth/permissions";
import { navigateTo } from "../../routing/navigate";
import { matchPath } from "../../routing/navigate";

interface FamilyPageProps {
  pathname: string;
}

export function FamilyPage({ pathname }: FamilyPageProps) {
  const isEdit = Boolean(matchPath("/family/edit", pathname));
  const [draft, setDraft] = useState<MockFamily>({ ...mockFamily });

  if (isEdit) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit family</h2>
          <button type="button" onClick={() => navigateTo("/family")} className="text-sm text-slate-400 hover:text-slate-200">
            Cancel
          </button>
        </div>
        <form
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            Object.assign(mockFamily, draft);
            navigateTo("/family");
          }}
        >
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
          <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
            Save changes
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div className="relative h-44 bg-cover bg-center md:h-56" style={{ backgroundImage: `url(${mockFamily.cover})` }}>
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
              <img src={mockFamily.logo} alt="" className="h-24 w-24 rounded-2xl border-4 border-slate-900 object-cover" />
              {canEdit() && (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-slate-900 p-1.5 text-slate-300">
                  <Camera size={12} />
                </span>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400">{mockFamily.code}</p>
              <h2 className="text-2xl font-semibold text-slate-100">{mockFamily.name}</h2>
              <p className="text-sm text-slate-400">{mockFamily.location}</p>
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
          <p className="mt-2 text-sm leading-relaxed text-slate-200">{mockFamily.description}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Origin</h3>
          <p className="mt-2 text-sm text-slate-200">{mockFamily.origin}</p>
          <p className="mt-2 text-xs text-slate-500">Founded {mockFamily.foundedYear}</p>
        </article>
      </section>

      <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Family history</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{mockFamily.history}</p>
      </article>
    </div>
  );
}
