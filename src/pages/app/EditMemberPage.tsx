import { useEffect, useState, type FormEvent } from "react";
import { matchPath, navigateTo } from "../../routing/navigate";
import { getMemberDetails, updateMember } from "../../services/memberService";
import type { MemberProfile, UpdateMemberPayload } from "../../types/member";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { logUnexpected } from "../../utils/logFailure";
import { ErrorState, LoadingState } from "../../components/ui/PageStates";
import { DatePicker } from "../../components/DatePicker";
import { ProfilePhotoPicker } from "../../components/ui/ProfilePhotoPicker";
import { resolveAvatarUrl } from "../../utils/defaultAvatar";
import { useFamilyData } from "../../context/FamilyDataContext";
import { mockFamily } from "../../data/mockFamily";

interface EditMemberPageProps {
  pathname: string;
}

type LifeStatus = "alive" | "deceased";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500";

function genderKey(gender: string): "male" | "female" | "other" {
  const value = gender.toLowerCase();
  if (value === "female") return "female";
  if (value === "other") return "other";
  return "male";
}

function existingPhoto(profile: MemberProfile | null): string {
  return profile?.images?.find((image) => image.isPrimary)?.imageUrl || profile?.images?.[0]?.imageUrl || "";
}

export function EditMemberPage({ pathname }: EditMemberPageProps) {
  const match = matchPath("/members/:id/edit", pathname);
  const id = Number(match?.params.id);
  const { refresh, members } = useFamilyData();
  const fallback = members.find((m) => m.id === String(id));
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>("alive");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    gender: "Male",
    dateOfBirth: "",
    dateOfDeath: "",
    email: "",
    phone: "",
    profession: "",
    biography: "",
    location: "",
    education: "",
    career: "",
    instagram: "",
    facebook: ""
  });

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setError("Invalid member id.");
      setLoading(false);
      return;
    }
    getMemberDetails(id)
      .then((data) => {
        setProfile(data);
        setLifeStatus(data.dateOfDeath ? "deceased" : "alive");
        setPhotoFile(null);
        setPhotoPreview((current) => {
          if (current) URL.revokeObjectURL(current);
          return "";
        });
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          nickname: data.nickname || "",
          gender: data.gender || "Male",
          dateOfBirth: data.dateOfBirth?.slice(0, 10) || "",
          dateOfDeath: data.dateOfDeath?.slice(0, 10) || "",
          email: data.email || "",
          phone: data.phone || "",
          profession: data.profession || "",
          biography: data.biography || "",
          location: fallback?.location || "",
          education: fallback?.education || "",
          career: fallback?.career || data.profession || "",
          instagram: data.socialLinks?.find((s) => s.platform.toLowerCase().includes("instagram"))?.url || "",
          facebook: data.socialLinks?.find((s) => s.platform.toLowerCase().includes("facebook"))?.url || ""
        });
      })
      .catch((err) => {
        logUnexpected("EditMember", err);
        setError(err instanceof ApiClientError ? err.message : "Unable to load member.");
      })
      .finally(() => setLoading(false));
  }, [id, fallback?.location, fallback?.education, fallback?.career]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    if (!form.firstName.trim()) {
      notify.validation("First name is required.");
      return;
    }

    const lastName =
      form.lastName.trim() ||
      mockFamily.name.replace(/\s+family$/i, "").trim() ||
      form.firstName.trim();

    setSaving(true);
    const payload: UpdateMemberPayload = {
      firstName: form.firstName.trim(),
      lastName,
      nickname: form.nickname || undefined,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || undefined,
      dateOfDeath: lifeStatus === "deceased" ? form.dateOfDeath || undefined : undefined,
      biography: form.biography || undefined,
      profession: form.profession || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      isRoot: profile.isRoot,
      parentId: profile.parent?.id,
      spouseId: profile.spouse?.id,
      socialLinks: [
        form.instagram ? { platform: "Instagram", url: form.instagram } : null,
        form.facebook ? { platform: "Facebook", url: form.facebook } : null
      ].filter(Boolean) as UpdateMemberPayload["socialLinks"]
    };
    try {
      await updateMember(id, payload, photoFile);
      await refresh();
      notify.success("Member updated successfully.");
      navigateTo(`/members/${id}`);
    } catch (err) {
      if (err instanceof ApiClientError) notify.fromApiError(err);
      else notify.error("Unable to update member right now.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading member..." />;
  if (error || !profile) return <ErrorState message={error || "Member not found."} />;

  const Field = ({
    label,
    children
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );

  const preview = photoPreview || existingPhoto(profile) || resolveAvatarUrl("", genderKey(form.gender));

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Edit member</h2>
        <button type="button" onClick={() => navigateTo(`/members/${id}`)} className="text-sm text-slate-400 hover:text-slate-200">
          Cancel
        </button>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="font-semibold text-slate-100">Basic information</h3>

        <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <ProfilePhotoPicker previewUrl={preview} onFileSelected={handlePhotoSelected} sizeClassName="h-24 w-24" />
          <div>
            <p className="text-sm font-medium text-slate-100">Profile photo</p>
            <p className="mt-1 text-xs text-slate-500">Tap the pen to choose a profile photo. It is saved with the member.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name *">
            <input className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </Field>
          <Field label="Nickname">
            <input className={inputClass} value={form.nickname} onChange={(e) => set("nickname", e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date of birth">
            <DatePicker value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
          </Field>
          <Field label="Gender">
            <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>
        </div>

        <Field label="Profession">
          <input className={inputClass} value={form.profession} onChange={(e) => set("profession", e.target.value)} />
        </Field>

        <fieldset className="text-sm">
          <legend className="text-slate-300">Life status</legend>
          <div className="mt-2 flex gap-2">
            {(["alive", "deceased"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setLifeStatus(status)}
                className={`rounded-xl px-3 py-2 capitalize ${
                  lifeStatus === status ? "bg-emerald-500 text-slate-950" : "border border-slate-700 text-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </fieldset>

        {lifeStatus === "deceased" ? (
          <Field label="Date of death">
            <DatePicker value={form.dateOfDeath} onChange={(v) => set("dateOfDeath", v)} />
          </Field>
        ) : null}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="font-semibold text-slate-100">Contact</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email">
            <input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="font-semibold text-slate-100">Location</h3>
        <Field label="Location">
          <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="font-semibold text-slate-100">Education & career</h3>
        <Field label="Education">
          <input className={inputClass} value={form.education} onChange={(e) => set("education", e.target.value)} />
        </Field>
        <Field label="Career">
          <textarea className={inputClass} rows={3} value={form.career} onChange={(e) => set("career", e.target.value)} />
        </Field>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="font-semibold text-slate-100">Biography</h3>
        <textarea className={inputClass} rows={5} value={form.biography} onChange={(e) => set("biography", e.target.value)} />
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="font-semibold text-slate-100">Social media</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Instagram">
            <input className={inputClass} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
          </Field>
          <Field label="Facebook">
            <input className={inputClass} value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
          </Field>
        </div>
      </section>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">
          {saving ? "Saving..." : "Save member"}
        </button>
        <button type="button" onClick={() => navigateTo(`/members/${id}`)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
