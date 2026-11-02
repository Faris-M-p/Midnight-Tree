"use client";

import { useActionState, useEffect } from "react";
import { createMemberAction, type MemberActionState } from "./actions";
import type { Member } from "@/types/database";
import { memberLabel } from "@/types/database";
import { buttonClass, fieldClass, labelClass } from "@/components/forms/AuthFormStyles";

const initial: MemberActionState = { error: null };

type Props = {
  familyId: string;
  members: Member[];
  canEdit: boolean;
};

export function AddMemberForm({ familyId, members, canEdit }: Props) {
  const [state, action, pending] = useActionState(createMemberAction, initial);

  useEffect(() => {
    if (state.ok) {
      const form = document.getElementById("add-member-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state.ok]);

  if (!canEdit) {
    return <p className="text-sm text-neutral-500">View-only access.</p>;
  }

  return (
    <form id="add-member-form" action={action} className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="font-medium text-neutral-900 dark:text-neutral-50">Add person</h3>
      <input type="hidden" name="familyId" value={familyId} />
      <label className={labelClass}>
        Type
        <select className={fieldClass} name="memberType" defaultValue="real">
          <option value="real">Real member</option>
          <option value="placeholder">Placeholder / unknown</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          First name
          <input className={fieldClass} name="firstName" />
        </label>
        <label className={labelClass}>
          Last name
          <input className={fieldClass} name="lastName" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Gender
          <select className={fieldClass} name="gender" defaultValue="unknown">
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className={labelClass}>
          Date of birth
          <input className={fieldClass} name="dateOfBirth" type="date" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
        <input type="checkbox" name="isDeceased" /> Deceased
      </label>
      <label className={labelClass}>
        Connect to existing (optional)
        <select className={fieldClass} name="relateToMemberId" defaultValue="">
          <option value="">— None —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {memberLabel(m)} ({m.member_code})
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Relationship
        <select className={fieldClass} name="relation" defaultValue="child">
          <option value="child">New person is child of selected</option>
          <option value="parent">New person is parent of selected</option>
          <option value="partner">New person is partner of selected</option>
        </select>
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Member added.</p> : null}
      <button className={buttonClass} type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add to family"}
      </button>
    </form>
  );
}
