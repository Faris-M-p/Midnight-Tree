"use client";

import { useEffect } from "react";
import type { AuthActionState } from "./actions";

/** Mirrors auth action errors into the browser DevTools console. */
export function useAuthErrorLog(form: "login" | "register", state: AuthActionState) {
  useEffect(() => {
    if (!state.error) return;
    console.error(`[auth:${form}] UI error`, {
      message: state.error,
      code: state.code ?? null,
      at: new Date().toISOString()
    });
  }, [form, state.error, state.code]);
}
