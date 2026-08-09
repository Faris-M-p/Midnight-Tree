import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { FamilyMember, MarriageUnion } from "../../types";
import { createMember } from "../../services/memberService";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { DatePicker } from "../DatePicker";
import { resolveAvatarUrl } from "../../utils/defaultAvatar";
import { computeMemberRanks, formatMemberLabel } from "../../utils/memberRanks";

interface AddMemberProps {
  open: boolean;
  onClose: () => void;
  members: FamilyMember[];
  unions: MarriageUnion[];
  onCreated: () => Promise<void> | void;
}

type Connection = "root" | "child" | "spouse";

export function AddMember({ open, onClose, members, unions, onCreated }: AddMemberProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dob, setDob] = useState("");
  const [lifeStatus, setLifeStatus] = useState<"alive" | "deceased">("alive");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [avatar, setAvatar] = useState("");
  const [connection, setConnection] = useState<Connection>("root");
  const [targetId, setTargetId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasRoot = members.some((m) => m.isRoot);
  const memberRanks = useMemo(() => computeMemberRanks(members, unions), [members, unions]);
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

  if (!open) return null;

  const preview = resolveAvatarUrl(avatar, gender);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setNickname("");
    setDob("");
    setLifeStatus("alive");
    setDateOfDeath("");
    setGender("male");
    setAvatar("");
    setConnection(hasRoot ? "child" : "root");
    setTargetId("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      notify.error("First name and last name are required.");
      return;
    }
    if (connection === "child" && !targetId) {
      notify.error("Select a parent couple.");
      return;
    }
    if (connection === "spouse" && !targetId) {
      notify.error("Select a member to connect as spouse.");
      return;
    }

    const union = couples.find((c) => c.id === targetId);
    setSubmitting(true);
    try {
      await createMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || undefined,
        gender: gender === "male" ? "Male" : "Female",
        dateOfBirth: dob || undefined,
        dateOfDeath: lifeStatus === "deceased" ? dateOfDeath || undefined : undefined,
        isRoot: connection === "root",
        parentId: connection === "child" && union ? Number(union.spouse1Id) : undefined,
        spouseId: connection === "spouse" ? Number(targetId) : undefined,
        images: avatar ? [{ imageUrl: avatar, isPrimary: true, sortOrder: 0 }] : undefined
      });
      notify.success("Member created successfully.");
      reset();
      onClose();
      await onCreated();
    } catch (error) {
      if (error instanceof ApiClientError) notify.fromApiError(error);
      else notify.error("Unable to create member right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-950/70" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Add member</h2>
            <p className="text-xs text-slate-500">Quickly place someone in the family. Details can be added later.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <img src={preview} alt="" className="h-16 w-16 rounded-xl object-cover border border-slate-800" />
          <label className="flex-1 text-sm">
            <span className="text-slate-300">Profile image URL</span>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            First name *
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
            />
          </label>
          <label className="text-sm">
            Last name *
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <label className="mt-3 block text-sm">
          Nickname
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
          />
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="text-sm">
            Date of birth
            <div className="mt-1">
              <DatePicker value={dob} onChange={setDob} />
            </div>
          </div>
          <label className="text-sm">
            Gender
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
        </div>

        <fieldset className="mt-3 text-sm">
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

        {lifeStatus === "deceased" && (
          <div className="mt-3 text-sm">
            Date of death
            <div className="mt-1">
              <DatePicker value={dateOfDeath} onChange={setDateOfDeath} />
            </div>
          </div>
        )}

        <label className="mt-3 block text-sm">
          Connection *
          <select
            value={connection}
            onChange={(e) => {
              setConnection(e.target.value as Connection);
              setTargetId("");
            }}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="root" disabled={hasRoot}>
              Root member
            </option>
            <option value="child">Child</option>
            <option value="spouse">Spouse</option>
          </select>
        </label>

        {connection === "child" && (
          <label className="mt-3 block text-sm">
            Parent couple
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="">Select couple</option>
              {couples.map((couple) => (
                <option key={couple.id} value={couple.id}>
                  {couple.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {connection === "spouse" && (
          <label className="mt-3 block text-sm">
            Member
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="">Select member</option>
              {[...members]
                .sort((a, b) => (memberRanks[a.id] ?? 9999) - (memberRanks[b.id] ?? 9999))
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {formatMemberLabel(memberRanks, member.id, member.name)}
                    {member.nickname ? ` (${member.nickname})` : ""}
                  </option>
                ))}
            </select>
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Add member"}
          </button>
        </div>
      </form>
    </div>
  );
}
