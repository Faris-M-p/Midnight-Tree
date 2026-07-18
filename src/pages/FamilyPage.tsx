import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { GitBranch, LogOut, RefreshCcw, Save } from "lucide-react";
import type { AuthUser } from "../types/auth";
import { ApiClientError } from "../services/apiClient";
import { getFamilyDetails, updateFamilyDetails } from "../services/familyService";
import type { FamilyDetails } from "../types/family";

interface FamilyPageProps {
  onNavigate: (path: "/" | "/register" | "/login" | "/dashboard" | "/family" | "/members" | "/timeline" | "/gallery" | "/analytics" | "/tree") => void;
  onLogout: () => void;
  currentUser: AuthUser | null;
  isLoggingOut: boolean;
}

const protectedNav: Array<{
  label: string;
  path: "/dashboard" | "/family" | "/members" | "/timeline" | "/gallery" | "/analytics";
}> = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Family", path: "/family" },
  { label: "Members", path: "/members" },
  { label: "Timeline", path: "/timeline" },
  { label: "Gallery", path: "/gallery" },
  { label: "Analytics", path: "/analytics" }
];

interface FamilyFormState {
  familyName: string;
  description: string;
}

export function FamilyPage({ onNavigate, onLogout, currentUser, isLoggingOut }: FamilyPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FamilyFormState, string>>>({});
  const [family, setFamily] = useState<FamilyDetails | null>(null);
  const [form, setForm] = useState<FamilyFormState>({ familyName: "", description: "" });

  const loadFamily = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await getFamilyDetails();
      setFamily(data);
      setForm({
        familyName: data.familyName ?? "",
        description: data.description ?? ""
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.statusCode >= 500
          ? "Unable to load family details right now. Please try again."
          : error.message);
      } else {
        setErrorMessage("Unable to load family details right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFamily();
  }, []);

  const isDirty = useMemo(() => {
    if (!family) {
      return false;
    }

    return (
      form.familyName !== (family.familyName ?? "") ||
      form.description !== (family.description ?? "")
    );
  }, [family, form.description, form.familyName]);

  const updateField = (field: keyof FamilyFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDirty || isSaving) {
      return;
    }

    const nextErrors: Partial<Record<keyof FamilyFormState, string>> = {};
    if (!form.familyName.trim()) {
      nextErrors.familyName = "Family name is required.";
    }

    if (form.description.length > 1000) {
      nextErrors.description = "Description must be 1000 characters or less.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await updateFamilyDetails({
        familyName: form.familyName.trim(),
        description: form.description.trim() || undefined
      });

      setFamily(updated);
      setForm({
        familyName: updated.familyName ?? "",
        description: updated.description ?? ""
      });
      setSuccessMessage("Family details updated successfully.");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFieldErrors((current) => ({ ...current, ...(error.fieldErrors as Partial<Record<keyof FamilyFormState, string>>) }));
        setErrorMessage(error.statusCode >= 500
          ? "Unable to update family details right now. Please try again."
          : error.message);
      } else {
        setErrorMessage("Unable to update family details right now. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/95">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <button type="button" onClick={() => onNavigate("/dashboard")} className="inline-flex items-center gap-2 text-left">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
              <GitBranch className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-100">Midnight Chronicle</span>
              <span className="block text-xs text-slate-400">Authenticated Workspace</span>
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {protectedNav.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  item.path === "/family"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <p className="max-w-[200px] truncate text-sm text-slate-400">
              {currentUser?.username ? `Signed in as ${currentUser.username}` : "Authenticated"}
            </p>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-white">Family Details</h1>
            <p className="text-sm text-slate-400">View and update your family profile information.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadFamily()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="inline-flex items-center gap-3 text-sm text-slate-300">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              Loading family details...
            </div>
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-300">
            {errorMessage}
          </div>
        ) : null}

        {!isLoading && family ? (
          <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Family Code</label>
                <input
                  value={family.familyCode}
                  disabled
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Family Name</label>
                <input
                  value={form.familyName}
                  onChange={(event) => updateField("familyName", event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
                    fieldErrors.familyName
                      ? "border-rose-500 bg-rose-950/20"
                      : "border-slate-700 bg-slate-950/70 focus:border-emerald-500"
                  }`}
                />
                <p className="mt-1 min-h-[1.25rem] text-xs text-rose-400">{fieldErrors.familyName ?? " "}</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Description</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-slate-100 outline-none transition ${
                  fieldErrors.description
                    ? "border-rose-500 bg-rose-950/20"
                    : "border-slate-700 bg-slate-950/70 focus:border-emerald-500"
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="min-h-[1.25rem] text-xs text-rose-400">{fieldErrors.description ?? " "}</p>
                <p className="text-xs text-slate-500">{form.description.length}/1000</p>
              </div>
            </div>

            {successMessage ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-sm text-emerald-300">
                {successMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : null}
      </main>
    </div>
  );
}
