import { GitBranch, Pencil, Trash2, X } from "lucide-react";
import type { MemberProfile, MemberRelationSummary } from "../../types/member";
import { canDeleteMember, canEditMember } from "../../auth/permissions";
import { navigateTo } from "../../routing/navigate";
import { formatMemberLabel, memberDisplayId, type MemberRanks } from "../../utils/memberRanks";
import { memberDisplayName } from "../../utils/memberName";
import { resolveAvatarUrl } from "../../utils/defaultAvatar";
import { LocationView, toCoord } from "./LocationView";
import type { MarriageUnion } from "../../types";

export interface MemberDetailsProps {
  profile: MemberProfile;
  location?: string;
  memberRanks?: MemberRanks;
  unions?: MarriageUnion[];
  onDelete?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
  onOpenMember?: (memberId: number) => void;
  showViewInTree?: boolean;
  embedded?: boolean;
  busy?: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="mt-3 text-sm text-slate-200">{children}</div>
    </section>
  );
}

function relationGender(gender?: string | null): "male" | "female" | "other" {
  const value = (gender || "").toLowerCase();
  if (value === "female") return "female";
  if (value === "other") return "other";
  return "male";
}

function RelationPerson({
  rel,
  memberRanks,
  onOpen
}: {
  rel: MemberRelationSummary;
  memberRanks?: MemberRanks;
  onOpen: (memberId: number) => void;
}) {
  const name = memberDisplayName(rel);
  const label = memberRanks ? formatMemberLabel(memberRanks, String(rel.id), name) : name;
  const photo = resolveAvatarUrl(rel.photoUrl, relationGender(rel.gender));

  return (
    <button
      type="button"
      onClick={() => onOpen(rel.id)}
      className="flex w-full items-center gap-2 rounded-xl px-1 py-1.5 text-left transition hover:bg-slate-800/70"
    >
      <img src={photo} alt="" className="h-9 w-9 shrink-0 rounded-full border border-slate-700 object-cover" />
      <span className="min-w-0 truncate text-sm text-slate-100">{label}</span>
    </button>
  );
}

function RelationList({
  title,
  people,
  memberRanks,
  onOpen
}: {
  title: string;
  people: MemberRelationSummary[];
  memberRanks?: MemberRanks;
  onOpen: (memberId: number) => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{title}</p>
      {people.length ? (
        <div className="mt-1 space-y-0.5">
          {people.map((person) => (
            <RelationPerson key={person.id} rel={person} memberRanks={memberRanks} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-400">—</p>
      )}
    </div>
  );
}

export function MemberDetails({
  profile,
  location,
  memberRanks,
  unions = [],
  onDelete,
  onEdit,
  onClose,
  onOpenMember,
  showViewInTree = true,
  embedded = false,
  busy = false
}: MemberDetailsProps) {
  const photo = profile.images?.find((i) => i.isPrimary)?.imageUrl || profile.images?.[0]?.imageUrl;
  const displayId = memberRanks ? memberDisplayId(memberRanks, String(profile.id)) : undefined;
  const hasMapPin = toCoord(profile.latitude) !== null && toCoord(profile.longitude) !== null;
  const socialLinks = profile.socialLinks ?? [];
  const allowEdit = canEditMember(profile.id, unions);
  const allowDelete = canDeleteMember(profile.id, unions);

  const handleEdit = () => {
    if (onEdit) onEdit();
    else navigateTo(`/members/${profile.id}/edit`);
  };

  const openMember = (memberId: number) => {
    if (onOpenMember) onOpenMember(memberId);
    else navigateTo(`/members/${memberId}`);
  };

  return (
    <div className={embedded ? "space-y-4" : "mx-auto max-w-4xl space-y-4 p-4 md:p-6"}>
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberDisplayName(profile))}&background=064e3b&color=fff`}
            alt=""
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div>
            <h2 className="flex flex-wrap items-baseline gap-2 text-2xl font-semibold text-slate-100">
              {displayId ? <span className="text-base font-bold text-emerald-400">{displayId}</span> : null}
              <span>{memberDisplayName(profile)}</span>
            </h2>
            <p className="text-sm text-slate-400">{profile.nickname || (profile.isRoot ? "Root member" : "Family member")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {profile.dateOfBirth || "DOB unknown"} · {profile.dateOfDeath ? "Deceased" : "Alive"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allowEdit && (
            <button
              type="button"
              disabled={busy}
              onClick={handleEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-emerald-500 disabled:opacity-60"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          {showViewInTree ? (
            <button
              type="button"
              onClick={() => navigateTo(`/family-tree?member=${profile.id}`)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-emerald-500"
            >
              <GitBranch size={14} /> View in family tree
            </button>
          ) : null}
          {allowDelete && onDelete && (
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300 hover:bg-rose-950/30 disabled:opacity-60"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-slate-500"
            >
              <X size={14} /> Close
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Basic information">
          <dl className="grid grid-cols-2 gap-2">
            <dt className="text-slate-500">First name</dt>
            <dd>{profile.firstName}</dd>
            <dt className="text-slate-500">Nickname</dt>
            <dd>{profile.nickname || "—"}</dd>
            <dt className="text-slate-500">Gender</dt>
            <dd>{profile.gender || "—"}</dd>
            <dt className="text-slate-500">Profession</dt>
            <dd>{profile.profession || "—"}</dd>
          </dl>
        </Section>
        <Section title="Biography">
          <p className="leading-relaxed text-slate-300">{profile.biography || "No biography added yet."}</p>
        </Section>
        <Section title="Contact">
          <p>Email: {profile.email || "—"}</p>
          <p className="mt-1">Phone: {profile.phone || "—"}</p>
        </Section>
        <div className={hasMapPin ? "md:col-span-2" : undefined}>
          <Section title="Location">
            <LocationView
              locationName={profile.locationName || location}
              latitude={profile.latitude ?? (profile as { Latitude?: unknown }).Latitude}
              longitude={profile.longitude ?? (profile as { Longitude?: unknown }).Longitude}
            />
          </Section>
        </div>
        {socialLinks.length ? (
          <Section title="Social links">
            <ul className="space-y-1">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <span className="text-slate-500">{link.platform}: </span>
                  <a href={link.url} className="text-emerald-400 hover:underline" target="_blank" rel="noreferrer">
                    {link.username || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>

      <Section title="Family relationships">
        <div className="grid gap-4 sm:grid-cols-3">
          <RelationList
            title="Parent"
            people={profile.parent ? [profile.parent] : []}
            memberRanks={memberRanks}
            onOpen={openMember}
          />
          <RelationList
            title="Spouse"
            people={profile.spouse ? [profile.spouse] : []}
            memberRanks={memberRanks}
            onOpen={openMember}
          />
          <RelationList
            title="Children"
            people={profile.children ?? []}
            memberRanks={memberRanks}
            onOpen={openMember}
          />
        </div>
      </Section>
    </div>
  );
}
