"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "./actions";
import { buttonClass, cardClass, fieldClass, labelClass } from "@/components/forms/AuthFormStyles";

const initial: AuthActionState = { error: null };

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <form action={action} className={cardClass}>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Create account</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        You become the Account Owner. Family tree members are added later — no mandatory “create myself”.
      </p>

      <div className="mt-5 space-y-3">
        <label className={labelClass}>
          Full name
          <input className={fieldClass} name="fullName" autoComplete="name" required />
        </label>
        <label className={labelClass}>
          Email
          <input className={fieldClass} name="email" type="email" autoComplete="email" required />
        </label>
        <label className={labelClass}>
          Password
          <input
            className={fieldClass}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className={labelClass}>
          Confirm password
          <input
            className={fieldClass}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
      </div>

      {state.error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className={`${buttonClass} mt-5`} type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </button>

      <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Already have an account?{" "}
        <Link className="font-medium text-neutral-900 underline dark:text-neutral-100" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
