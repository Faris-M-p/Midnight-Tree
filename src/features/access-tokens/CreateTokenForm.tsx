"use client";

import { useActionState } from "react";
import { createAccessTokenAction, type TokenState } from "./actions";
import { buttonClass, fieldClass, labelClass } from "@/components/forms/AuthFormStyles";

const initial: TokenState = { error: null };

export function CreateTokenForm({
  families
}: {
  families: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createAccessTokenAction, initial);

  return (
    <form action={action} className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="font-medium">Create access token</h3>
      <p className="text-xs text-neutral-500">Account Owner only. Raw secret shown once.</p>
      <label className={labelClass}>
        Name
        <input className={fieldClass} name="name" required />
      </label>
      <label className={labelClass}>
        Family
        <select className={fieldClass} name="familyId" required>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Permission
        <select className={fieldClass} name="permission" defaultValue="view">
          <option value="view">View</option>
          <option value="edit">Edit</option>
        </select>
      </label>
      <label className={labelClass}>
        Expires in (days)
        <input className={fieldClass} name="expiresDays" type="number" defaultValue={90} min={1} />
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.rawToken ? (
        <p className="break-all rounded bg-neutral-100 p-2 text-xs dark:bg-neutral-900">
          Copy now: {state.rawToken}
        </p>
      ) : null}
      <button className={buttonClass} type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create token"}
      </button>
    </form>
  );
}
