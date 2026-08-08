import { useMemo, useState } from "react";
import { getToken, listTokens, saveToken } from "../../data/stores";
import type { MockAccessToken, TokenPermission, TokenScope, TokenStatus } from "../../data/mockAccessTokens";
import { mockMembers } from "../../data/mockMembers";
import { matchPath, navigateTo } from "../../routing/navigate";
import { EmptyState } from "../../components/ui/PageStates";

interface AccessTokensPageProps {
  pathname: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

const statusClass: Record<TokenStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-300",
  inactive: "bg-slate-800 text-slate-300",
  revoked: "bg-rose-500/15 text-rose-300",
  expired: "bg-amber-500/15 text-amber-300"
};

function TokenForm({ initial }: { initial?: MockAccessToken }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [permission, setPermission] = useState<TokenPermission>(initial?.permission ?? "view");
  const [scope, setScope] = useState<TokenScope>(initial?.scope ?? "entire-family");
  const [memberId, setMemberId] = useState(initial?.memberId ?? "");
  const [expiresOn, setExpiresOn] = useState(initial?.expiresOn ?? "2026-12-31");
  const [status, setStatus] = useState<TokenStatus>(initial?.status ?? "active");

  const needsMember = scope !== "entire-family";
  const selected = mockMembers.find((m) => m.id === memberId);

  return (
    <form
      className="mx-auto max-w-2xl space-y-4 p-4 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const token: MockAccessToken = {
          id: initial?.id ?? `tok-${Date.now()}`,
          name: name || "Untitled token",
          status,
          permission,
          scope,
          memberId: needsMember ? memberId : undefined,
          memberName: needsMember && selected ? `${selected.firstName} ${selected.lastName}` : undefined,
          createdOn: initial?.createdOn ?? new Date().toISOString().slice(0, 10),
          expiresOn,
          lastUsed: initial?.lastUsed ?? "—",
          activeSessions: initial?.activeSessions ?? 0,
          usageCount: initial?.usageCount ?? 0,
          tokenPreview: initial?.tokenPreview ?? `mct_${Math.random().toString(36).slice(2, 6)}…`,
          activity: initial?.activity ?? [{ id: "new", date: "Today", label: "Token created" }]
        };
        saveToken(token);
        navigateTo(`/access-tokens/${token.id}`);
      }}
    >
      <label className="block text-sm">
        Token name
        <input className={`${inputClass} mt-1`} value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="block text-sm">
        Permission
        <select className={`${inputClass} mt-1`} value={permission} onChange={(e) => setPermission(e.target.value as TokenPermission)}>
          <option value="view">View</option>
          <option value="edit">Edit</option>
        </select>
      </label>
      <label className="block text-sm">
        Scope
        <select className={`${inputClass} mt-1`} value={scope} onChange={(e) => setScope(e.target.value as TokenScope)}>
          <option value="entire-family">Entire family</option>
          <option value="selected-member">Selected member</option>
          <option value="member-descendants">Selected member + descendants</option>
        </select>
      </label>
      {needsMember && (
        <label className="block text-sm">
          Selected member
          <select className={`${inputClass} mt-1`} value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
            <option value="">Select member</option>
            {mockMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
          {scope === "member-descendants" && selected && (
            <p className="mt-2 text-xs text-slate-500">
              This token can view {selected.firstName} {selected.lastName} and all descendants.
            </p>
          )}
        </label>
      )}
      <label className="block text-sm">
        Expiry date
        <input type="date" className={`${inputClass} mt-1`} value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
      </label>
      <label className="block text-sm">
        Status
        <select className={`${inputClass} mt-1`} value={status} onChange={(e) => setStatus(e.target.value as TokenStatus)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          {initial ? "Save token" : "Generate token"}
        </button>
        <button type="button" onClick={() => navigateTo("/access-tokens")} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AccessTokensPage({ pathname }: AccessTokensPageProps) {
  const [, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const generateMatch = matchPath("/access-tokens/generate", pathname);
  const editMatch = matchPath("/access-tokens/:id/edit", pathname);
  const activityMatch = matchPath("/access-tokens/:id/activity", pathname);
  const detailMatch = matchPath("/access-tokens/:id", pathname);

  if (generateMatch) return <TokenForm />;
  if (editMatch) {
    const token = getToken(editMatch.params.id);
    if (!token) return <EmptyState title="Token not found" message="This token is no longer available." />;
    return <TokenForm initial={token} />;
  }

  const showDetail = (activityMatch || (detailMatch && detailMatch.params.id !== "generate")) as
    | { params: { id: string } }
    | null;
  if (showDetail) {
    const token = getToken(showDetail.params.id);
    if (!token) return <EmptyState title="Token not found" message="This token is no longer available." />;
    const isActivity = Boolean(activityMatch);

    const setStatus = (status: TokenStatus) => {
      saveToken({ ...token, status });
      refresh();
    };

    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-slate-500">{token.tokenPreview}</p>
              <h2 className="text-xl font-semibold">{token.name}</h2>
              <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${statusClass[token.status]}`}>{token.status}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigateTo(`/access-tokens/${token.id}/edit`)} className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm">
                Edit
              </button>
              <button type="button" onClick={() => navigateTo(`/access-tokens/${token.id}/activity`)} className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm">
                Activity
              </button>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>Permission: {token.permission}</div>
            <div>
              Scope: {token.scope.replace("-", " ")}
              {token.memberName ? ` · ${token.memberName}` : ""}
            </div>
            <div>Created: {token.createdOn}</div>
            <div>Expires: {token.expiresOn}</div>
            <div>Last used: {token.lastUsed}</div>
            <div>Usage count: {token.usageCount}</div>
            <div>Active sessions: {token.activeSessions}</div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                saveToken({ ...token, expiresOn: "2027-08-08" });
                refresh();
              }}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs"
            >
              Extend expiry
            </button>
            {token.status === "active" ? (
              <button type="button" onClick={() => setStatus("inactive")} className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs">
                Deactivate
              </button>
            ) : (
              <button type="button" onClick={() => setStatus("active")} className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs">
                Activate
              </button>
            )}
            <button type="button" onClick={() => setStatus("revoked")} className="rounded-xl border border-rose-500/40 px-3 py-1.5 text-xs text-rose-300">
              Revoke
            </button>
          </div>
        </div>

        {isActivity && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="font-semibold">Recent activity</h3>
            {token.activity.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {token.activity.map((item) => (
                  <li key={item.id} className="flex gap-3 border-b border-slate-800/80 pb-2 text-sm last:border-0">
                    <span className="w-16 text-emerald-400">{item.date}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    );
  }

  const tokens = useMemo(() => listTokens(), [pathname]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => navigateTo("/access-tokens/generate")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Generate token
        </button>
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              {["Token name", "Status", "Permission", "Scope", "Created", "Expiry", "Last used", "Sessions", "Usage", "Actions"].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.id} className="border-t border-slate-800/80">
                <td className="px-3 py-3 font-medium">{token.name}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass[token.status]}`}>{token.status}</span>
                </td>
                <td className="px-3 py-3 capitalize">{token.permission}</td>
                <td className="px-3 py-3">
                  {token.scope.replace("-", " ")}
                  {token.memberName ? ` · ${token.memberName}` : ""}
                </td>
                <td className="px-3 py-3">{token.createdOn}</td>
                <td className="px-3 py-3">{token.expiresOn}</td>
                <td className="px-3 py-3">{token.lastUsed}</td>
                <td className="px-3 py-3">{token.activeSessions}</td>
                <td className="px-3 py-3">{token.usageCount}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => navigateTo(`/access-tokens/${token.id}`)} className="text-xs text-emerald-400">
                      View
                    </button>
                    <button type="button" onClick={() => navigateTo(`/access-tokens/${token.id}/edit`)} className="text-xs text-slate-300">
                      Edit
                    </button>
                    <button type="button" onClick={() => navigateTo(`/access-tokens/${token.id}/activity`)} className="text-xs text-slate-300">
                      Activity
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {tokens.map((token) => (
          <button
            key={token.id}
            type="button"
            onClick={() => navigateTo(`/access-tokens/${token.id}`)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left"
          >
            <p className="font-medium">{token.name}</p>
            <p className="mt-1 text-xs text-slate-400">
              {token.permission} · {token.scope} · {token.status}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
