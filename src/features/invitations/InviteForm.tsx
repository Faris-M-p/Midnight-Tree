"use client";

import { useActionState } from "react";
import { createInvitationAction, type InviteState } from "./actions";
import { buttonClass, fieldClass, labelClass } from "@/components/forms/AuthFormStyles";

const initial: InviteState = { error: null };

export function InviteForm({ familyId }: { familyId: string }) {
  const [state, action, pending] = useActionState(createInvitationAction, initial);

  return (
    <form action={action} className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="font-medium">Invite by email</h3>
      <input type="hidden" name="familyId" value={familyId} />
      <label className={labelClass}>
        Email
        <input className={fieldClass} name="email" type="email" required />
      </label>
      <label className={labelClass}>
        Role
        <select className={fieldClass} name="role" defaultValue="viewer">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.inviteUrl ? (
        <p className="break-all text-xs text-emerald-700">
          Share this link once: {state.inviteUrl}
        </p>
      ) : null}
      <button className={buttonClass} type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create invitation"}
      </button>
    </form>
  );
}
