import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { FamilyMember, MarriageUnion } from "../../types";
import type { MemberProfile } from "../../types/member";
import { createMember } from "../../services/memberService";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { DatePicker } from "../DatePicker";
import { ProfilePhotoPicker } from "../ui/ProfilePhotoPicker";
import { LocationPicker, type MemberLocationValue } from "./LocationPicker";
import { resolveAvatarUrl } from "../../utils/defaultAvatar";
import { computeMemberRanks, formatMemberLabel, type MemberRanks } from "../../utils/memberRanks";
import { mockFamily } from "../../data/mockFamily";

export interface AddMemberProps {
  open: boolean;
  onClose: () => void;
  members: FamilyMember[];
  unions: MarriageUnion[];
  memberRanks?: MemberRanks;
  onCreated?: (created: MemberProfile) => Promise<void> | void;
}

type Connection = "root" | "child" | "spouse";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

export function AddMember({
  open,
  onClose,
  members,
  unions,
  memberRanks: ranksProp,
  onCreated
}: AddMemberProps) {
  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dob, setDob] = useState("");
  const [lifeStatus, setLifeStatus] = useState<"alive" | "deceased">("alive");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState<MemberLocationValue>({
    locationName: "",
    latitude: null,
    longitude: null
  });
  const [connection, setConnection] = useState<Connection>("root");
  const [targetId, setTargetId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasRoot = members.some((m) => m.isRoot);
  const memberRanks = useMemo(
    () => ranksProp ?? computeMemberRanks(members, unions),
    [ranksProp, members, unions]
  );

  const couples = useMemo(
    () =>
      unions.map((union) => {
        const a = members.find((m) => m.id === union.spouse1Id);
        const b = members.find((m) => m.id === union.spouse2Id);
        const labelA = a ? formatMemberLabel(memberRanks, a.id, a.name) : "Unknown";
        const labelB = b ? formatMemberLabel(memberRanks, b.id, b.name) : "Unknown";
        return { id: union.id, label: `${labelA} + ${labelB}`, spouse1Id: union.spouse1Id };
      }),
    [unions, members, memberRanks]
  );

  const singleMembers = useMemo(
    () =>
      [...members]
        .filter((m) => !unions.some((u) => u.spouse1Id === m.id || u.spouse2Id === m.id))
        .sort((a, b) => (memberRanks[a.id] ?? 9999) - (memberRanks[b.id] ?? 9999)),
    [members, unions, memberRanks]
  );

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setNickname("");
    setDob("");
    setLifeStatus("alive");
    setDateOfDeath("");
    setGender("male");
    setPhotoFile(null);
    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    setProfession("");
    setLocation({ locationName: "", latitude: null, longitude: null });
    setConnection(members.some((m) => m.isRoot) ? "child" : "root");
    setTargetId("");
  }, [open]);

  if (!open) return null;

  const preview = photoPreview || resolveAvatarUrl("", gender);

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
    if (!firstName.trim()) {
      notify.validation("First name is required.");
      return;
    }
    if (connection === "root" && hasRoot) {
      notify.validation("Root member already exists. Add this member as a child or spouse.");
      return;
    }
    if (connection === "child" && !targetId) {
      notify.validation("Select a parent couple.");
      return;
    }
    if (connection === "spouse" && !targetId) {
      notify.validation("Select a member to connect as spouse.");
      return;
    }

    const union = couples.find((c) => c.id === targetId);
    const nameParts = firstName.trim().split(/\s+/).filter(Boolean);
    const apiFirstName = nameParts.shift() || firstName.trim();
    const inferredLast =
      nameParts.join(" ") ||
      members
        .map((m) => m.name.trim().split(/\s+/).filter(Boolean).at(-1))
        .filter((part): part is string => Boolean(part && part !== apiFirstName))
        .at(0) ||
      mockFamily.name.replace(/\s+family$/i, "").trim() ||
      apiFirstName;
    setSubmitting(true);
    try {
      const created = await createMember(
        {
          firstName: apiFirstName,
          lastName: inferredLast,
          nickname: nickname.trim() || undefined,
          gender: gender === "male" ? "Male" : "Female",
          dateOfBirth: dob || undefined,
          dateOfDeath: lifeStatus === "deceased" ? dateOfDeath || undefined : undefined,
          profession: profession.trim() || undefined,
          locationName: location.locationName.trim() || undefined,
          latitude: location.latitude,
          longitude: location.longitude,
          isRoot: connection === "root",
          parentId: connection === "child" && union ? Number(union.spouse1Id) : undefined,
          spouseId: connection === "spouse" ? Number(targetId) : undefined
        },
        photoFile
      );
      notify.success("Member created successfully.");
      onClose();
      await onCreated?.(created);
    } catch (error) {
      if (error instanceof ApiClientError) notify.fromApiError(error);
      else notify.error("Unable to create member right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-slate-950 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Add member</h2>
            <p className="text-xs text-slate-500">Same form on Members and Family Tree. Use # numbers to pick relatives.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <ProfilePhotoPicker previewUrl={preview} onFileSelected={handlePhotoSelected} />
            <p className="text-xs text-slate-500">Tap the pen to choose a profile photo. It is saved with the member.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              First name *
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm text-slate-300">
              Nickname
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="text-sm text-slate-300">
              Date of birth
              <div className="mt-1">
                <DatePicker value={dob} onChange={setDob} />
              </div>
            </div>
            <label className="text-sm text-slate-300">
              Gender
              <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")} className={inputClass}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <label className="block text-sm text-slate-300">
            Profession
            <input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </label>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <p className="mb-2 text-sm font-medium text-slate-200">Location</p>
            <LocationPicker value={location} onChange={setLocation} inputClassName={inputClass} />
          </div>

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
            <div className="text-sm text-slate-300">
              Date of death
              <div className="mt-1">
                <DatePicker value={dateOfDeath} onChange={setDateOfDeath} />
              </div>
            </div>
          ) : null}

          <label className="block text-sm text-slate-300">
            Connection *
            <select
              value={connection}
              onChange={(e) => {
                setConnection(e.target.value as Connection);
                setTargetId("");
              }}
              className={inputClass}
            >
              <option value="root" disabled={hasRoot}>
                Root member
              </option>
              <option value="child">Child of couple</option>
              <option value="spouse">Spouse of member</option>
            </select>
          </label>

          {connection === "child" ? (
            <label className="block text-sm text-slate-300">
              Parent couple
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={inputClass}>
                <option value="">Select couple</option>
                {couples.map((couple) => (
                  <option key={couple.id} value={couple.id}>
                    {couple.label}
                  </option>
                ))}
              </select>
              {couples.length === 0 ? (
                <p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
                  No couples yet. Add a spouse first, then you can add children.
                </p>
              ) : null}
            </label>
          ) : null}

          {connection === "spouse" ? (
            <label className="block text-sm text-slate-300">
              Member
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={inputClass} disabled={singleMembers.length === 0}>
                <option value="">Select member</option>
                {singleMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {formatMemberLabel(memberRanks, member.id, member.name)}
                    {member.nickname ? ` (${member.nickname})` : ""}
                  </option>
                ))}
              </select>
              {singleMembers.length === 0 ? (
                <p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
                  No single members available. Everyone is already in a marriage.
                </p>
              ) : null}
            </label>
          ) : null}

          {hasRoot && connection === "root" ? (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
              Root member already exists. Add this member as a child or spouse.
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              (connection === "root" && hasRoot) ||
              (connection === "child" && couples.length === 0) ||
              (connection === "spouse" && singleMembers.length === 0)
            }
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Add member"}
          </button>
        </div>
      </form>
    </div>
  );
}
