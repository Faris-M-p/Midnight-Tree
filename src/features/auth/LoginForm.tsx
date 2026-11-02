"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "./actions";
import { buttonClass, cardClass, fieldClass, labelClass } from "@/components/forms/AuthFormStyles";

const initial: AuthActionState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className={cardClass}>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Account Owner email and password. Access-token login lands in a later module.
      </p>

      <div className="mt-5 space-y-3">
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
            autoComplete="current-password"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
        New here?{" "}
        <Link className="font-medium text-neutral-900 underline dark:text-neutral-100" href="/register">
          Create account
        </Link>
      </p>
    </form>
  );
}
