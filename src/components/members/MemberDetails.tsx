import { GitBranch, Pencil, Trash2 } from "lucide-react";
import type { MemberProfile, MemberRelationSummary } from "../../types/member";
import { canDelete, canEdit } from "../../auth/permissions";
import { navigateTo } from "../../routing/navigate";
import { mockStories } from "../../data/mockStories";
import { mockEvents } from "../../data/mockEvents";
import { mockAlbums } from "../../data/mockGallery";
import { formatMemberLabel, memberDisplayId, type MemberRanks } from "../../utils/memberRanks";

interface MemberDetailsProps {
  profile: MemberProfile;
  location?: string;
  education?: string;
  career?: string;
  memberRanks?: MemberRanks;
  onDelete?: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="mt-3 text-sm text-slate-200">{children}</div>
    </section>
  );
}

function relationLabel(ranks: MemberRanks | undefined, rel: MemberRelationSummary | null | undefined) {
  if (!rel) return "—";
  if (!ranks) return rel.fullName;
  return formatMemberLabel(ranks, String(rel.id), rel.fullName);
}

export function MemberDetails({ profile, location, education, career, memberRanks, onDelete }: MemberDetailsProps) {
  const photo = profile.images?.find((i) => i.isPrimary)?.imageUrl || profile.images?.[0]?.imageUrl;
  const stories = mockStories.filter((s) => s.relatedMemberIds.some((id) => profile.fullName.toLowerCase().includes(id)));
  const events = mockEvents.filter((e) => e.relatedMemberIds.length > 0).slice(0, 4);
  const photos = mockAlbums.flatMap((a) => a.photos).slice(0, 6);
  const displayId = memberRanks ? memberDisplayId(memberRanks, String(profile.id)) : undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=064e3b&color=fff`}
            alt=""
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div>
            <h2 className="flex flex-wrap items-baseline gap-2 text-2xl font-semibold text-slate-100">
              {displayId ? <span className="text-base font-bold text-emerald-400">{displayId}</span> : null}
              <span>{profile.fullName}</span>
            </h2>
            <p className="text-sm text-slate-400">{profile.nickname || (profile.isRoot ? "Root member" : "Family member")}</p>
            <p className="mt-1 text-xs text-slate-500">
              {profile.dateOfBirth || "DOB unknown"} · {profile.dateOfDeath ? "Deceased" : "Alive"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit() && (
            <button
              type="button"
              onClick={() => navigateTo(`/members/${profile.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-emerald-500"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => navigateTo(`/family-tree?member=${profile.id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-emerald-500"
          >
            <GitBranch size={14} /> View in family tree
          </button>
          {canDelete() && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 px-3 py-2 text-sm text-rose-300 hover:bg-rose-950/30"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Basic information">
          <dl className="grid grid-cols-2 gap-2">
            <dt className="text-slate-500">First name</dt>
            <dd>{profile.firstName}</dd>
            <dt className="text-slate-500">Last name</dt>
            <dd>{profile.lastName}</dd>
            <dt className="text-slate-500">Gender</dt>
            <dd>{profile.gender || "—"}</dd>
            <dt className="text-slate-500">Nickname</dt>
            <dd>{profile.nickname || "—"}</dd>
          </dl>
        </Section>
        <Section title="Biography">
          <p className="leading-relaxed text-slate-300">{profile.biography || "No biography added yet."}</p>
        </Section>
        <Section title="Contact">
          <p>Email: {profile.email || "—"}</p>
          <p className="mt-1">Phone: {profile.phone || "—"}</p>
        </Section>
        <Section title="Location">
          <p>{location || "Not specified"}</p>
        </Section>
        <Section title="Education">
          <p>{education || "Not specified"}</p>
        </Section>
        <Section title="Career">
          <p>{career || profile.profession || "Not specified"}</p>
        </Section>
      </div>

      <Section title="Social links">
        {profile.socialLinks?.length ? (
          <ul className="space-y-1">
            {profile.socialLinks.map((link) => (
              <li key={link.id}>
                <span className="text-slate-500">{link.platform}: </span>
                <a href={link.url} className="text-emerald-400 hover:underline" target="_blank" rel="noreferrer">
                  {link.username || link.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No social links yet.</p>
        )}
      </Section>

      <Section title="Family relationships">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Parent</p>
            <p>{relationLabel(memberRanks, profile.parent)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Spouse</p>
            <p>{relationLabel(memberRanks, profile.spouse)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Children</p>
            <p>
              {profile.children?.length
                ? profile.children.map((c) => relationLabel(memberRanks, c)).join(", ")
                : "—"}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Photos">
        {photos.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {photos.map((photoItem) => (
              <img key={photoItem.id} src={photoItem.url} alt="" className="h-20 w-full rounded-lg object-cover" />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No photos yet.</p>
        )}
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Memories">
          {stories.length ? (
            <ul className="space-y-2">
              {stories.map((story) => (
                <li key={story.id}>
                  <button type="button" onClick={() => navigateTo(`/stories/${story.id}`)} className="text-left text-emerald-400 hover:underline">
                    {story.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No linked stories yet.</p>
          )}
        </Section>
        <Section title="Events">
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id}>
                <button type="button" onClick={() => navigateTo(`/events/${event.id}`)} className="text-left text-emerald-400 hover:underline">
                  {event.title}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Notes">
        <p className="text-slate-500">Private family notes will appear here once the notes API is connected.</p>
      </Section>
    </div>
  );
}
