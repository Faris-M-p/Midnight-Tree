import { useEffect, useState, type FormEvent } from "react";
import { matchPath, navigateTo } from "../../routing/navigate";
import { getMemberDetails, updateMember } from "../../services/memberService";
import type { MemberProfile, UpdateMemberPayload } from "../../types/member";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { ErrorState, LoadingState } from "../../components/ui/PageStates";
import { DatePicker } from "../../components/DatePicker";
import { useFamilyData } from "../../context/FamilyDataContext";

interface EditMemberPageProps {
  pathname: string;
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
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Unable to load member."))
      .finally(() => setLoading(false));
  }, [id, fallback?.location, fallback?.education, fallback?.career]);

  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    const payload: UpdateMemberPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      nickname: form.nickname || undefined,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || undefined,
      dateOfDeath: form.dateOfDeath || undefined,
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
      await updateMember(id, payload);
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

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <h3 className="font-semibold text-slate-100">Basic information</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name">
            <input className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </Field>
          <Field label="Last name">
            <input className={inputClass} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
          </Field>
          <Field label="Nickname">
            <input className={inputClass} value={form.nickname} onChange={(e) => set("nickname", e.target.value)} />
          </Field>
          <Field label="Gender">
            <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <h3 className="font-semibold text-slate-100">Personal information</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date of birth">
            <DatePicker value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
          </Field>
          <Field label="Date of death">
            <DatePicker value={form.dateOfDeath} onChange={(v) => set("dateOfDeath", v)} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
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

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <h3 className="font-semibold text-slate-100">Location</h3>
        <Field label="Location">
          <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <h3 className="font-semibold text-slate-100">Education & career</h3>
        <Field label="Education">
          <input className={inputClass} value={form.education} onChange={(e) => set("education", e.target.value)} />
        </Field>
        <Field label="Profession">
          <input className={inputClass} value={form.profession} onChange={(e) => set("profession", e.target.value)} />
        </Field>
        <Field label="Career">
          <textarea className={inputClass} rows={3} value={form.career} onChange={(e) => set("career", e.target.value)} />
        </Field>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <h3 className="font-semibold text-slate-100">Biography</h3>
        <textarea className={inputClass} rows={5} value={form.biography} onChange={(e) => set("biography", e.target.value)} />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
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
