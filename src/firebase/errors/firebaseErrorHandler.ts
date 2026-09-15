/**
 * =============================================================================
 * FILE: src/firebase/errors/firebaseErrorHandler.ts
 * ROLE: Map Firebase errors to user-facing messages
 * =============================================================================
 * Mirrors the existing ApiClientError idea without changing apiClient.ts.
 * Raw Firebase codes stay in `code` for developers; `message` is friendly.
 * =============================================================================
 */

import { FirebaseError } from "firebase/app";
import { logFailure } from "../../utils/logFailure";

export class FirebaseClientError extends Error {
  code: string;
  logged = false;

  constructor(message: string, code = "firebase/unknown") {
    super(message);
    this.name = "FirebaseClientError";
    this.code = code;
  }
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Invalid credentials",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-login-credentials": "Invalid email or password.",
  "auth/admin-restricted-operation": "This sign-in method is turned off in Firebase Authentication.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Authentication.",
  "auth/user-disabled": "This account is disabled.",
  "auth/invalid-email": "Invalid email",
  "auth/email-already-in-use": "Email already exists",
  "auth/weak-password": "Password is too weak",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error",
  "permission-denied": "Firestore rules are blocking this. Open Firestore → Rules, paste firestore.rules from the project, click Publish, then sign in again.",
  "storage/unauthorized": "Firebase Storage is blocking this. Open Storage → Rules, paste storage.rules from the project, click Publish, then try again.",
  "storage/unauthenticated": "You are not signed in.",
  "storage/retry-limit-exceeded": "Upload failed. Please try again.",
  "storage/canceled": "Upload was cancelled.",
  "unauthenticated": "You are not signed in.",
  "unavailable": "Network error",
  "deadline-exceeded": "Network error",
  "not-found": "The requested record was not found.",
  "already-exists": "This record already exists.",
  "failed-precondition": "This action cannot be completed right now.",
  "resource-exhausted": "Too many requests. Please try again later.",
  "cancelled": "The request was cancelled.",
  "invalid-argument": "The request is not valid."
};

function normalizeCode(code: string): string {
  return code.replace(/^firestore\//, "").replace(/^functions\//, "").replace(/^storage\//, "storage/");
}

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseClientError) {
    return error.message;
  }

  if (error instanceof FirebaseError) {
    const code = normalizeCode(error.code);
    return FRIENDLY_MESSAGES[code] ?? FRIENDLY_MESSAGES[error.code] ?? "Something went wrong. Please try again.";
  }

  if (error instanceof Error && error.message.includes("Firebase is not configured")) {
    return "Firebase is not configured.";
  }

  if (error instanceof Error && /network|fetch|offline/i.test(error.message)) {
    return "Network error";
  }

  return "Something went wrong. Please try again.";
}

export function toFirebaseClientError(error: unknown): FirebaseClientError {
  if (error instanceof FirebaseClientError) {
    return error;
  }

  const code = error instanceof FirebaseError ? normalizeCode(error.code) : "firebase/unknown";
  return new FirebaseClientError(getFirebaseErrorMessage(error), code);
}

export async function runFirebase<T>(scope: string, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    const mapped = toFirebaseClientError(error);
    logFailure(scope, mapped, { code: mapped.code });
    mapped.logged = true;
    throw mapped;
  }
}
