"use client";

import { useActionState } from "react";
import { createFamilyAction, type FamilyActionState } from "./actions";
import { buttonClass, cardClass, fieldClass, labelClass } from "@/components/forms/AuthFormStyles";

const initial: FamilyActionState = { error: null };

export function CreateFamilyForm() {
  const [state, action, pending] = useActionState(createFamilyAction, initial);

  return (
    <form action={action} className={cardClass}>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Create your family</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        You become Family Owner. Start the tree from any person later — no self-member required.
      </p>

      <div className="mt-5 space-y-3">
        <label className={labelClass}>
          Family name
          <input className={fieldClass} name="name" required maxLength={120} />
        </label>
        <label className={labelClass}>
          Description <span className="font-normal text-neutral-500">(optional)</span>
          <textarea className={fieldClass} name="description" rows={3} maxLength={2000} />
        </label>
        <label className={labelClass}>
          Location <span className="font-normal text-neutral-500">(optional)</span>
          <input className={fieldClass} name="location" maxLength={200} />
        </label>
      </div>

      {state.error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className={`${buttonClass} mt-5`} type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create family"}
      </button>
    </form>
  );
}
