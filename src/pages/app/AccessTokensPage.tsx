import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  createAccessToken,
  deleteAccessToken,
  getAccessToken,
  listAccessTokens,
  setAccessTokenStatus,
  updateAccessToken
} from "../../services/accessTokenService";
import { ApiClientError } from "../../services/apiClient";
import { notify } from "../../utils/notify";
import { useActionLock } from "../../hooks/useActionLock";
import { matchPath, navigateTo } from "../../routing/navigate";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/PageStates";
import { useFamilyData } from "../../context/FamilyDataContext";
import { formatMemberLabel } from "../../utils/memberRanks";
import type {
  AccessToken,
  AccessTokenExpiryPreset,
  AccessTokenPermission,
  AccessTokenScope,
  AccessTokenStatus,
  CreateAccessTokenPayload
} from "../../types/accessToken";

interface AccessTokensPageProps {
  pathname: string;
}

type ModalMode = "generate" | "edit" | "view" | "activity" | null;

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500";

const statusClass: Record<AccessTokenStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-300",
  Inactive: "bg-slate-800 text-slate-300",
  Expired: "bg-amber-500/15 text-amber-300"
};

const scopeLabels: Record<AccessTokenScope, string> = {
  EntireFamily: "Entire Family",
  SelectedMember: "Selected Member",
  MemberDescendants: "Member & Descendants"
};

function formatScopeLabel(token: Pick<AccessToken, "permission" | "scope" | "memberName">): string {
  if (token.permission === "View" || !token.scope) {
    return "—";
  }
  const label = scopeLabels[token.scope] ?? token.scope;
  return token.memberName ? `${label} · ${token.memberName}` : label;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function inferExpiryPreset(expiresOn: string): AccessTokenExpiryPreset {
  const ms = new Date(expiresOn).getTime() - Date.now();
  const days = ms / (1000 * 60 * 60 * 24);
  if (Math.abs(days - 30) < 1.5) return "30Days";
  if (Math.abs(days - 90) < 1.5) return "90Days";
  if (Math.abs(days - 182) < 3) return "6Months";
  if (Math.abs(days - 365) < 3) return "1Year";
  return "Custom";
}

function StatusBadge({ status }: { status: AccessTokenStatus }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass[status]}`}>{status}</span>;
}

interface MemberOption {
  id: number;
  label: string;
}

interface TokenFormState {
  tokenName: string;
  permission: AccessTokenPermission;
  scope: AccessTokenScope | null;
  memberId: string;
  expiryPreset: AccessTokenExpiryPreset;
  customExpiresOn: string;
}

function emptyForm(): TokenFormState {
  return {
    tokenName: "",
    permission: "View",
    scope: null,
    memberId: "",
    expiryPreset: "90Days",
    customExpiresOn: ""
  };
}

function formFromToken(token: AccessToken): TokenFormState {
  const preset = inferExpiryPreset(token.expiresOn);
  const isEdit = token.permission === "Edit";
  return {
    tokenName: token.tokenName,
    permission: token.permission,
    scope: isEdit ? token.scope ?? "EntireFamily" : null,
    memberId: isEdit && token.memberId ? String(token.memberId) : "",
    expiryPreset: preset,
    customExpiresOn: preset === "Custom" ? toDateInputValue(token.expiresOn) : ""
  };
}

function buildPayload(form: TokenFormState): CreateAccessTokenPayload {
  // View tokens always use EntireFamily internally; Scope is hidden in the modal.
  if (form.permission === "View") {
    return {
      tokenName: form.tokenName.trim(),
      permission: "View",
      scope: "EntireFamily",
      memberId: null,
      expiryPreset: form.expiryPreset,
      customExpiresOn:
        form.expiryPreset === "Custom" && form.customExpiresOn
          ? new Date(`${form.customExpiresOn}T23:59:59.000Z`).toISOString()
          : null
    };
  }

  const scope = form.scope ?? "EntireFamily";
  const needsMember = scope !== "EntireFamily";
  return {
    tokenName: form.tokenName.trim(),
    permission: "Edit",
    scope,
    memberId: needsMember && form.memberId ? Number(form.memberId) : null,
    expiryPreset: form.expiryPreset,
    customExpiresOn:
      form.expiryPreset === "Custom" && form.customExpiresOn
        ? new Date(`${form.customExpiresOn}T23:59:59.000Z`).toISOString()
        : null
  };
}

function validateForm(form: TokenFormState): string | null {
  if (!form.tokenName.trim()) return "Token name is required.";
  if (form.permission === "Edit") {
    if (!form.scope) return "Scope is required for Edit permission.";
    if (form.scope !== "EntireFamily" && !form.memberId) return "Select a family member for this scope.";
  }
  if (form.expiryPreset === "Custom" && !form.customExpiresOn) return "Choose a custom expiry date.";
  return null;
}

function ModalShell({
  title,
  onClose,
  children,
  wide
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto border border-slate-800 bg-slate-950 shadow-2xl sm:rounded-2xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-900"
          >
            Close
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

function TokenFields({
  form,
  setForm,
  members,
  membersLoading,
  readOnly,
  showExpiredNotice
}: {
  form: TokenFormState;
  setForm: (next: TokenFormState) => void;
  members: MemberOption[];
  membersLoading: boolean;
  readOnly?: boolean;
  showExpiredNotice?: boolean;
}) {
  const isEditPermission = form.permission === "Edit";
  const needsMember = isEditPermission && form.scope !== null && form.scope !== "EntireFamily";

  return (
    <div className="space-y-4">
      {showExpiredNotice && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          This token is expired. Extend the expiry date before it can be used again.
        </div>
      )}
      <label className="block text-sm text-slate-300">
        Token Name
        <input
          className={`${inputClass} mt-1`}
          value={form.tokenName}
          onChange={(e) => setForm({ ...form, tokenName: e.target.value })}
          placeholder="Aunt Meera – View Tree"
          required
          disabled={readOnly}
        />
      </label>
      <label className="block text-sm text-slate-300">
        Permission
        <select
          className={`${inputClass} mt-1`}
          value={form.permission}
          onChange={(e) => {
            const permission = e.target.value as AccessTokenPermission;
            if (permission === "View") {
              setForm({ ...form, permission, scope: null, memberId: "" });
              return;
            }
            setForm({
              ...form,
              permission,
              scope: "EntireFamily",
              memberId: ""
            });
          }}
          disabled={readOnly}
        >
          <option value="View">View</option>
          <option value="Edit">Edit</option>
        </select>
        <p className="mt-1 text-xs text-slate-500">
          {form.permission === "View"
            ? "Read-only access to the entire family."
            : "Allows editing based on the selected scope."}
        </p>
      </label>
      {isEditPermission && (
        <label className="block text-sm text-slate-300">
          Scope
          <select
            className={`${inputClass} mt-1`}
            value={form.scope ?? "EntireFamily"}
            onChange={(e) =>
              setForm({
                ...form,
                scope: e.target.value as AccessTokenScope,
                memberId: e.target.value === "EntireFamily" ? "" : form.memberId
              })
            }
            disabled={readOnly}
          >
            <option value="EntireFamily">Entire Family</option>
            <option value="SelectedMember">Selected Member</option>
            <option value="MemberDescendants">Member & Descendants</option>
          </select>
        </label>
      )}
      {needsMember && (
        <label className="block text-sm text-slate-300">
          Selected Member
          <select
            className={`${inputClass} mt-1`}
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
            required
            disabled={readOnly || membersLoading}
          >
            <option value="">{membersLoading ? "Loading members…" : "Select member"}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm text-slate-300">
        Expiry
        <select
          className={`${inputClass} mt-1`}
          value={form.expiryPreset}
          onChange={(e) => setForm({ ...form, expiryPreset: e.target.value as AccessTokenExpiryPreset })}
          disabled={readOnly}
        >
          <option value="30Days">30 Days</option>
          <option value="90Days">90 Days</option>
          <option value="6Months">6 Months</option>
          <option value="1Year">1 Year</option>
          <option value="Custom">Custom Date</option>
        </select>
      </label>
      {form.expiryPreset === "Custom" && (
        <label className="block text-sm text-slate-300">
          Custom Date
          <input
            type="date"
            className={`${inputClass} mt-1`}
            value={form.customExpiresOn}
            onChange={(e) => setForm({ ...form, customExpiresOn: e.target.value })}
            required
            disabled={readOnly}
          />
        </label>
      )}
    </div>
  );
}

export function AccessTokensPage({ pathname }: AccessTokensPageProps) {
  const { members: familyMembers, memberRanks, isLoading: familyLoading } = useFamilyData();
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AccessToken | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState<TokenFormState>(emptyForm());
  const { isBusy, run } = useActionLock();
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const members = useMemo<MemberOption[]>(
    () =>
      [...familyMembers]
        .sort((a, b) => (memberRanks[a.id] ?? 9999) - (memberRanks[b.id] ?? 9999))
        .map((m) => ({
          id: Number(m.id),
          label: formatMemberLabel(memberRanks, m.id, m.name)
        }))
        .filter((m) => Number.isFinite(m.id)),
    [familyMembers, memberRanks]
  );
  const membersLoading = familyLoading;

  const routeGenerate = Boolean(matchPath("/access-tokens/generate", pathname));
  const routeEdit = matchPath("/access-tokens/:id/edit", pathname);
  const routeActivity = matchPath("/access-tokens/:id/activity", pathname);
  const routeDetail = matchPath("/access-tokens/:id", pathname);
  const routeId = useMemo(() => {
    const raw = routeEdit?.params.id ?? routeActivity?.params.id ?? routeDetail?.params.id;
    if (!raw || raw === "generate") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [routeEdit, routeActivity, routeDetail]);

  const loadTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listAccessTokens();
      setTokens(items);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Unable to load access tokens.";
      setError(message);
      notify.fromApiError(err instanceof ApiClientError ? err : { message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTokens();
  }, [loadTokens]);

  const openGenerate = useCallback(() => {
    setRawToken(null);
    setCopied(false);
    setForm(emptyForm());
    setActiveId(null);
    setDetail(null);
    setModal("generate");
    if (!routeGenerate) navigateTo("/access-tokens/generate");
  }, [routeGenerate]);

  const openEdit = useCallback(
    async (id: number) => {
      setRawToken(null);
      setActiveId(id);
      setModal("edit");
      setDetailLoading(true);
      if (!routeEdit) navigateTo(`/access-tokens/${id}/edit`);
      try {
        const token = await getAccessToken(id);
        setDetail(token);
        setForm(formFromToken(token));
      } catch (err) {
        notify.fromApiError(err instanceof ApiClientError ? err : { message: "Unable to load token." });
        setModal(null);
        navigateTo("/access-tokens");
      } finally {
        setDetailLoading(false);
      }
    },
    [routeEdit]
  );

  const openView = useCallback(
    async (id: number) => {
      setRawToken(null);
      setActiveId(id);
      setModal("view");
      setDetailLoading(true);
      if (!routeDetail || routeActivity) navigateTo(`/access-tokens/${id}`);
      try {
        const token = await getAccessToken(id);
        setDetail(token);
      } catch (err) {
        notify.fromApiError(err instanceof ApiClientError ? err : { message: "Unable to load token." });
        setModal(null);
        navigateTo("/access-tokens");
      } finally {
        setDetailLoading(false);
      }
    },
    [routeDetail, routeActivity]
  );

  const openActivity = useCallback(
    async (id: number) => {
      setRawToken(null);
      setActiveId(id);
      setModal("activity");
      setDetailLoading(true);
      if (!routeActivity) navigateTo(`/access-tokens/${id}/activity`);
      try {
        const token = await getAccessToken(id);
        setDetail(token);
      } catch (err) {
        notify.fromApiError(err instanceof ApiClientError ? err : { message: "Unable to load token." });
        setModal(null);
        navigateTo("/access-tokens");
      } finally {
        setDetailLoading(false);
      }
    },
    [routeActivity]
  );

  const closeModal = useCallback(() => {
    setModal(null);
    setActiveId(null);
    setDetail(null);
    setRawToken(null);
    setCopied(false);
    setForm(emptyForm());
    if (pathname !== "/access-tokens") navigateTo("/access-tokens");
  }, [pathname]);

  useEffect(() => {
    if (routeGenerate) {
      setModal("generate");
      return;
    }
    if (routeEdit && routeId) {
      void openEdit(routeId);
      return;
    }
    if (routeActivity && routeId) {
      void openActivity(routeId);
      return;
    }
    if (routeDetail && routeId && routeDetail.params.id !== "generate") {
      void openView(routeId);
      return;
    }
    if (pathname === "/access-tokens") {
      setModal(null);
      setActiveId(null);
      setDetail(null);
      setRawToken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once per pathname change
  }, [pathname]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateForm(form);
    if (validation) {
      notify.validation(validation);
      return;
    }
    await run(async () => {
      try {
        const result = await createAccessToken(buildPayload(form));
        setRawToken(result.rawToken);
        setDetail(result.token);
        notify.success("Token generated successfully.");
        await loadTokens();
      } catch (err) {
        notify.fromApiError(err instanceof ApiClientError ? err : { message: "Unable to generate token." });
      }
    });
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeId) return;
    const validation = validateForm(form);
    if (validation) {
      notify.validation(validation);
      return;
    }
    await run(async () => {
      try {
        const token = await updateAccessToken(activeId, buildPayload(form));
        setDetail(token);
        notify.success("Access token updated.");
        await loadTokens();
        closeModal();
      } catch (err) {
        notify.fromApiError(err instanceof ApiClientError ? err : { message: "Unable to update token." });
      }
    });
  };

  const handleToggleStatus = async (token: AccessToken) => {
    if (token.status === "Expired") {
      notify.warning("Expired tokens cannot be reactivated. Extend the expiry date first.");
      return;
    }
    const next = token.status === "Active" ? "Inactive" : "Active";
    const ok =
      next === "Inactive"
        ? window.confirm("Deactivate this access token?\n\nThis token will no longer be usable for login.")
        : window.confirm("Activate this access token?\n\nThis token will become usable for login again.");
    if (!ok) return;
    await run(async () => {
      try {
        await setAccessTokenStatus(token.id, next);
        notify.success(next === "Inactive" ? "Access token deactivated." : "Access token activated.");
        await loadTokens();
        if (detail?.id === token.id) {
          const refreshed = await getAccessToken(token.id);
          setDetail(refreshed);
        }
      } catch (err) {
        notify.fromApiError(err instanceof ApiClientError ? err : { message: "Unable to update token status." });
      }
    });
  };

  const handleDelete = async (token: AccessToken) => {
    const ok = window.confirm("Delete this access token?\n\nThis action cannot be undone.");
    if (!ok) return;
    await run(async () => {
      try {
        await deleteAccessToken(token.id);
        notify.success("Access token deleted.");
        await loadTokens();
        if (activeId === token.id) closeModal();
      } catch (err) {
        notify.fromApiError(err instanceof ApiClientError ? err : { message: "Unable to delete token." });
      }
    });
  };

  const copyRawToken = async () => {
    if (!rawToken) return;
    try {
      await navigator.clipboard.writeText(rawToken);
      setCopied(true);
      notify.success("Token copied to clipboard.");
    } catch {
      notify.error("Unable to copy token. Please copy it manually.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openGenerate}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Generate Token
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading access tokens…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadTokens()} />
      ) : tokens.length === 0 ? (
        <EmptyState
          title="No access tokens yet"
          message="Generate a token to share limited family access with relatives."
          action={
            <button
              type="button"
              onClick={openGenerate}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Generate Token
            </button>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 md:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  {[
                    "Token Name",
                    "Status",
                    "Permission",
                    "Scope",
                    "Created",
                    "Expiry",
                    "Last Used",
                    "Sessions",
                    "Usage",
                    "Actions"
                  ].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.id} className="border-t border-slate-800/80">
                    <td className="px-3 py-3 font-medium text-slate-100">{token.tokenName}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={token.status} />
                    </td>
                    <td className="px-3 py-3">{token.permission}</td>
                    <td className="px-3 py-3">{formatScopeLabel(token)}</td>
                    <td className="px-3 py-3 text-slate-300">{formatDate(token.createdOn)}</td>
                    <td className="px-3 py-3 text-slate-300">{formatDate(token.expiresOn)}</td>
                    <td className="px-3 py-3 text-slate-300">{formatDate(token.lastUsedOn)}</td>
                    <td className="px-3 py-3">{token.activeSessions}</td>
                    <td className="px-3 py-3">{token.usageCount}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => void openView(token.id)} className="text-xs text-emerald-400">
                          View
                        </button>
                        <button type="button" onClick={() => void openEdit(token.id)} className="text-xs text-slate-300">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void openActivity(token.id)}
                          className="text-xs text-slate-300"
                        >
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
                onClick={() => void openView(token.id)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-100">{token.tokenName}</p>
                  <StatusBadge status={token.status} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {token.permission} · {formatScopeLabel(token)} · Expires {formatDate(token.expiresOn)}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {modal === "generate" && (
        <ModalShell title={rawToken ? "Token generated successfully." : "Generate Token"} onClose={closeModal} wide>
          {rawToken ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-xs uppercase tracking-wider text-emerald-300/80">Generated Token</p>
                <p className="mt-2 break-all font-mono text-sm text-emerald-100">{rawToken}</p>
              </div>
              <button
                type="button"
                onClick={() => void copyRawToken()}
                className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                {copied ? "Copied" : "Copy Token"}
              </button>
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                This token will only be shown once. Make sure you copy and securely share it.
              </p>
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
              >
                Done
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => void handleGenerate(e)}>
              <TokenFields form={form} setForm={setForm} members={members} membersLoading={membersLoading} />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                >
                  Generate Token
                </button>
              </div>
            </form>
          )}
        </ModalShell>
      )}

      {modal === "edit" && (
        <ModalShell title="Edit Access Token" onClose={closeModal} wide>
          {detailLoading || !detail ? (
            <LoadingState label="Loading token…" />
          ) : (
            <form className="space-y-4" onSubmit={(e) => void handleUpdate(e)}>
              <TokenFields
                form={form}
                setForm={setForm}
                members={members}
                membersLoading={membersLoading}
                showExpiredNotice={detail.status === "Expired"}
              />
              <div className="flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:flex-wrap sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {detail.status !== "Expired" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleToggleStatus(detail)}
                      className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 disabled:opacity-60"
                    >
                      {detail.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleDelete(detail)}
                    className="rounded-xl border border-rose-500/40 px-3 py-2 text-xs text-rose-300 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </ModalShell>
      )}

      {modal === "view" && (
        <ModalShell title="Token Details" onClose={closeModal} wide>
          {detailLoading || !detail ? (
            <LoadingState label="Loading token…" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-slate-500">{detail.tokenPreview}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-100">{detail.tokenName}</h3>
                  <div className="mt-2">
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void openEdit(detail.id)}
                    className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void openActivity(detail.id)}
                    className="rounded-xl border border-slate-700 px-3 py-1.5 text-sm"
                  >
                    Activity
                  </button>
                </div>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Permission</dt>
                  <dd>{detail.permission}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Scope</dt>
                  <dd>{formatScopeLabel(detail)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Created</dt>
                  <dd>{formatDate(detail.createdOn)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Expiry</dt>
                  <dd>{formatDate(detail.expiresOn)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Last Used</dt>
                  <dd>{formatDate(detail.lastUsedOn)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Sessions</dt>
                  <dd>{detail.activeSessions}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Usage</dt>
                  <dd>{detail.usageCount}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                {detail.status !== "Expired" && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleToggleStatus(detail)}
                    className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs disabled:opacity-60"
                  >
                    {detail.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleDelete(detail)}
                  className="rounded-xl border border-rose-500/40 px-3 py-1.5 text-xs text-rose-300 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </ModalShell>
      )}

      {modal === "activity" && (
        <ModalShell title="Token Activity" onClose={closeModal} wide>
          {detailLoading || !detail ? (
            <LoadingState label="Loading token…" />
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-100">{detail.tokenName}</h3>
                <p className="mt-1 text-xs text-slate-500">Preview: {detail.tokenPreview}</p>
              </div>
              <dl className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Last Used</dt>
                  <dd>{formatDate(detail.lastUsedOn)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Usage Count</dt>
                  <dd>{detail.usageCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Active Sessions</dt>
                  <dd>{detail.activeSessions}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Status</dt>
                  <dd>
                    <StatusBadge status={detail.status} />
                  </dd>
                </div>
              </dl>
              <div className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-200">Login and session activity</p>
                <p className="mt-2 text-sm text-slate-500">
                  Detailed login history, IP, and device information will appear here when activity tracking is
                  available.
                </p>
              </div>
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}
