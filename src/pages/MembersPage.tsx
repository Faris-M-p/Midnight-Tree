import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { GitBranch, LogOut, Plus, RefreshCcw, Save, Search, Trash2, UserRound } from "lucide-react";
import type { AuthUser } from "../types/auth";
import { ApiClientError } from "../services/apiClient";
import {
  createMember,
  deleteMember,
  getMemberDetails,
  getMembers,
  updateMember
} from "../services/memberService";
import type { MemberListItem, MemberProfile, MemberSavePayload } from "../types/member";

interface MembersPageProps {
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

interface MemberFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "" | "Male" | "Female" | "Other";
  dateOfBirth: string;
  dateOfDeath: string;
  isRoot: boolean;
  biography: string;
  profession: string;
  parentId: string;
  spouseId: string;
}

const initialForm: MemberFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  dateOfDeath: "",
  isRoot: false,
  biography: "",
  profession: "",
  parentId: "",
  spouseId: ""
};

function toInputDate(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function buildPayload(form: MemberFormState): MemberSavePayload {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    gender: form.gender || undefined,
    dateOfBirth: form.dateOfBirth || undefined,
    dateOfDeath: form.dateOfDeath || undefined,
    isRoot: form.isRoot,
    biography: form.biography.trim() || undefined,
    profession: form.profession.trim() || undefined,
    parentId: form.parentId ? Number(form.parentId) : undefined,
    spouseId: form.spouseId ? Number(form.spouseId) : undefined
  };
}

function formFromProfile(profile: MemberProfile): MemberFormState {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    gender: (profile.gender as MemberFormState["gender"]) ?? "",
    dateOfBirth: toInputDate(profile.dateOfBirth),
    dateOfDeath: toInputDate(profile.dateOfDeath),
    isRoot: profile.isRoot,
    biography: profile.biography ?? "",
    profession: profile.profession ?? "",
    parentId: profile.parent?.id ? String(profile.parent.id) : "",
    spouseId: profile.spouse?.id ? String(profile.spouse.id) : ""
  };
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function MembersPage({ onNavigate, onLogout, currentUser, isLoggingOut }: MembersPageProps) {
  const [searchText, setSearchText] = useState("");
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);

  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<MemberFormState>(initialForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MemberFormState, string>>>({});
  const [formGlobalError, setFormGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMembers = async (search = searchText) => {
    setIsListLoading(true);
    setListError("");

    try {
      const data = await getMembers({
        search: search.trim() || undefined,
        page: 1,
        pageSize: 50,
        sortBy: "firstName",
        sortDesc: false
      });
      setMembers(data.items);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setListError(error.statusCode >= 500
          ? "Unable to load members right now. Please try again."
          : error.message);
      } else {
        setListError("Unable to load members right now. Please try again.");
      }
      setMembers([]);
    } finally {
      setIsListLoading(false);
    }
  };

  const loadMemberDetails = async (memberId: number) => {
    setIsDetailsLoading(true);
    setDetailsError("");
    setMemberProfile(null);

    try {
      const profile = await getMemberDetails(memberId);
      setMemberProfile(profile);
      setSelectedMemberId(memberId);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setDetailsError(error.statusCode >= 500
          ? "Unable to load member details right now. Please try again."
          : error.message);
      } else {
        setDetailsError("Unable to load member details right now. Please try again.");
      }
      setSelectedMemberId(memberId);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAdd = () => {
    setFormMode("add");
    setForm(initialForm);
    setFormErrors({});
    setFormGlobalError("");
  };

  const startEdit = () => {
    if (!memberProfile) {
      return;
    }

    setFormMode("edit");
    setForm(formFromProfile(memberProfile));
    setFormErrors({});
    setFormGlobalError("");
  };

  const cancelForm = () => {
    setFormMode(null);
    setFormErrors({});
    setFormGlobalError("");
    setForm(initialForm);
  };

  const updateField = (field: keyof MemberFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value as never }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
    setFormGlobalError("");
  };

  const validateForm = (): Partial<Record<keyof MemberFormState, string>> => {
    const nextErrors: Partial<Record<keyof MemberFormState, string>> = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (form.dateOfBirth && form.dateOfDeath && form.dateOfDeath < form.dateOfBirth) {
      nextErrors.dateOfDeath = "Date of death cannot be before date of birth.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formMode || isSubmitting) {
      return;
    }

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormGlobalError("");

    try {
      const payload = buildPayload(form);

      if (formMode === "add") {
        const created = await createMember(payload);
        await loadMembers();
        await loadMemberDetails(created.id);
      } else if (formMode === "edit" && selectedMemberId) {
        const updated = await updateMember(selectedMemberId, payload);
        await loadMembers();
        await loadMemberDetails(updated.id);
      }

      cancelForm();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormErrors((current) => ({ ...current, ...(error.fieldErrors as Partial<Record<keyof MemberFormState, string>>) }));
        setFormGlobalError(error.statusCode >= 500
          ? "Unable to save member right now. Please try again."
          : error.message);
      } else {
        setFormGlobalError("Unable to save member right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMemberId || isDeleting) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    setIsDeleting(true);
    setFormGlobalError("");

    try {
      await deleteMember(selectedMemberId);
      setMemberProfile(null);
      setSelectedMemberId(null);
      setFormMode(null);
      await loadMembers();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormGlobalError(error.statusCode >= 500
          ? "Unable to delete member right now. Please try again."
          : error.message);
      } else {
        setFormGlobalError("Unable to delete member right now. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const pageTitle = useMemo(() => {
    if (formMode === "add") {
      return "Add Member";
    }

    if (formMode === "edit") {
      return "Edit Member";
    }

    return "Member Details";
  }, [formMode]);

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
                  item.path === "/members"
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

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h1 className="font-serif text-2xl text-white">Members</h1>
            <button
              type="button"
              onClick={() => void loadMembers()}
              disabled={isListLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw className={`h-4 w-4 ${isListLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="mb-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search members..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadMembers()}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Go
            </button>
          </div>

          <button
            type="button"
            onClick={startAdd}
            className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>

          {isListLoading ? (
            <div className="text-sm text-slate-300">Loading members...</div>
          ) : listError ? (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-300">{listError}</div>
          ) : members.length === 0 ? (
            <p className="text-sm text-slate-400">No members found.</p>
          ) : (
            <ul className="space-y-2">
              {members.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => void loadMemberDetails(member.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      selectedMemberId === member.id
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-950/50 hover:border-emerald-500/30"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-100">{member.fullName}</p>
                    <p className="text-xs text-slate-400">
                      {member.gender || "Unknown"} • DOB: {formatDate(member.dateOfBirth)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-white">{pageTitle}</h2>
            {memberProfile && !formMode ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-500/40 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            ) : null}
          </div>

          {formGlobalError ? (
            <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-300">
              {formGlobalError}
            </div>
          ) : null}

          {formMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 min-h-[1rem] text-xs text-rose-400">{formErrors.firstName ?? " "}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 min-h-[1rem] text-xs text-rose-400">{formErrors.lastName ?? " "}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(event) => updateField("gender", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) => updateField("dateOfBirth", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Date of Death</label>
                  <input
                    type="date"
                    value={form.dateOfDeath}
                    onChange={(event) => updateField("dateOfDeath", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 min-h-[1rem] text-xs text-rose-400">{formErrors.dateOfDeath ?? " "}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Profession</label>
                  <input
                    value={form.profession}
                    onChange={(event) => updateField("profession", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Parent Id</label>
                  <input
                    value={form.parentId}
                    onChange={(event) => updateField("parentId", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Spouse Id</label>
                  <input
                    value={form.spouseId}
                    onChange={(event) => updateField("spouseId", event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">Biography</label>
                <textarea
                  rows={3}
                  value={form.biography}
                  onChange={(event) => updateField("biography", event.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isRoot}
                  onChange={(event) => updateField("isRoot", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                />
                Mark as root member
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : formMode === "add" ? "Create Member" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : isDetailsLoading ? (
            <p className="text-sm text-slate-300">Loading member details...</p>
          ) : detailsError ? (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-300">{detailsError}</div>
          ) : memberProfile ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xl font-semibold text-slate-100">{memberProfile.fullName}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {memberProfile.gender || "Unknown"} • DOB: {formatDate(memberProfile.dateOfBirth)}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                  <p><span className="text-slate-500">Email:</span> {memberProfile.email || "N/A"}</p>
                  <p><span className="text-slate-500">Phone:</span> {memberProfile.phone || "N/A"}</p>
                  <p><span className="text-slate-500">Profession:</span> {memberProfile.profession || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                  <p><span className="text-slate-500">Parent:</span> {memberProfile.parent?.fullName || "N/A"}</p>
                  <p><span className="text-slate-500">Spouse:</span> {memberProfile.spouse?.fullName || "N/A"}</p>
                  <p><span className="text-slate-500">Children:</span> {memberProfile.children.length}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                <p className="mb-1 text-slate-500">Biography</p>
                <p>{memberProfile.biography || "No biography available."}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                  <p className="mb-2 text-slate-500">Addresses</p>
                  {memberProfile.addresses.length === 0 ? (
                    <p className="text-slate-400">No addresses.</p>
                  ) : (
                    <ul className="space-y-2">
                      {memberProfile.addresses.map((address) => (
                        <li key={address.id}>
                          <p>{address.addressLine1}</p>
                          <p className="text-xs text-slate-400">
                            {address.city}, {address.country}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                  <p className="mb-2 text-slate-500">Images</p>
                  {memberProfile.images.length === 0 ? (
                    <p className="text-slate-400">No images.</p>
                  ) : (
                    <ul className="space-y-2">
                      {memberProfile.images.map((image) => (
                        <li key={image.id}>
                          <a href={image.imageUrl} className="text-emerald-300 hover:underline" target="_blank" rel="noreferrer">
                            {image.caption || image.imageUrl}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                  <p className="mb-2 text-slate-500">Events</p>
                  {memberProfile.events.length === 0 ? (
                    <p className="text-slate-400">No events.</p>
                  ) : (
                    <ul className="space-y-2">
                      {memberProfile.events.map((entry) => (
                        <li key={entry.id}>
                          <p>{entry.title}</p>
                          <p className="text-xs text-slate-400">
                            {entry.eventType} • {formatDate(entry.eventDate)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                  <p className="mb-2 text-slate-500">Notes</p>
                  {memberProfile.notes.length === 0 ? (
                    <p className="text-slate-400">No notes.</p>
                  ) : (
                    <ul className="space-y-2">
                      {memberProfile.notes.map((note) => (
                        <li key={note.id}>
                          <p>{note.title}</p>
                          <p className="text-xs text-slate-400">{note.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">
                <p className="mb-2 text-slate-500">Social Links</p>
                {memberProfile.socialLinks.length === 0 ? (
                  <p className="text-slate-400">No social links.</p>
                ) : (
                  <ul className="space-y-2">
                    {memberProfile.socialLinks.map((link) => (
                      <li key={link.id}>
                        <a href={link.url} className="text-emerald-300 hover:underline" target="_blank" rel="noreferrer">
                          {link.platform}{link.username ? ` (${link.username})` : ""}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
              <UserRound className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-sm text-slate-400">
                Select a member to view details, or create a new member.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
