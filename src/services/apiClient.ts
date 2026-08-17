/**
 * =============================================================================
 * FILE: src/services/apiClient.ts
 * ROLE: Central HTTP helper for all API calls
 * =============================================================================
 * Every service (auth, members, tree) should call `apiRequest()` instead of
 * using fetch() directly. This file is responsible for:
 *
 *   1. Prefixing the path with env.apiBaseUrl
 *   2. Attaching the JWT Bearer token when the user is logged in
 *   3. Parsing the MidnightApi response envelope
 *   4. Throwing ApiClientError with friendly messages + fieldErrors
 *
 * UI pages catch ApiClientError for flow control.
 * Server validation / error messages are shown only in the toast bar.
 * =============================================================================
 */

import { env } from "../config/env";
import { logout } from "../auth/session";
import { navigateTo } from "../routing/navigate";
import { getAccessToken } from "./authSessionService";
import type { ApiErrorItem, ApiResponse } from "../types/api";
import { logFailure } from "../utils/logFailure";
import { beginApiRequest, endApiRequest } from "./loadingTracker";

/**
 * Error thrown when the API returns success=false or a non-OK HTTP status.
 * `fieldErrors` maps form field names → messages (e.g. email: "already exists").
 */
export class ApiClientError extends Error {
  statusCode: number;
  fieldErrors: Record<string, string>;
  errors: ApiErrorItem[];
  method?: string;
  path?: string;
  logged = false;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors: Record<string, string> = {},
    errors: ApiErrorItem[] = []
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.errors = errors;
  }
}

/** Login/register endpoints — 401 means bad credentials, not a dead session. */
const ANONYMOUS_AUTH_PATHS = new Set([
  "/api/accounts/login",
  "/api/accounts/register",
  "/api/accounts/verify-email",
  "/api/accounts/resend-verification",
  "/api/accounts/forgot-password",
  "/api/accounts/forgot-password/verify-otp",
  "/api/accounts/forgot-password/reset",
  "/api/access-tokens/login"
]);

let handlingUnauthorized = false;

function isAnonymousAuthPath(path: string): boolean {
  return ANONYMOUS_AUTH_PATHS.has(path.split("?")[0]);
}

/**
 * Backend auth middleware is the only JWT authority.
 * On 401 for a protected call: clear stored session and return to Login.
 */
function handleUnauthorized(path: string, statusCode: number): void {
  if (statusCode !== 401) return;
  if (isAnonymousAuthPath(path)) return;
  if (handlingUnauthorized) return;

  handlingUnauthorized = true;
  try {
    logout();
    const currentPath = window.location.pathname;
    if (currentPath !== "/login" && currentPath !== "/register") {
      navigateTo("/login");
    }
  } finally {
    queueMicrotask(() => {
      handlingUnauthorized = false;
    });
  }
}

/** Maps backend Display names / labels onto frontend form field keys */
const fieldAliasMap: Record<string, string> = {
  username: "username",
  email: "email",
  password: "password",
  "confirm password": "confirmPassword",
  "family code": "familyCode",
  "family name": "familyName",
  description: "description",
  "first name": "firstName",
  "last name": "lastName",
  "date of birth": "dateOfBirth",
  "date of death": "dateOfDeath",
  nickname: "nickname",
  profession: "profession",
  biography: "biography",
  location: "locationName",
  "location name": "locationName",
  "parent id": "parentId",
  "spouse id": "spouseId",
  "token name": "tokenName",
  permission: "permission",
  scope: "scope",
  "selected member": "memberId",
  "member id": "memberId",
  expiry: "expiryPreset",
  "expiry preset": "expiryPreset",
  "custom expiry date": "customExpiresOn"
};

function normalizeFieldName(field?: string | null): string | null {
  if (!field) {
    return null;
  }

  const normalized = field.trim().toLowerCase();
  return fieldAliasMap[normalized] ?? normalized;
}

/** Convert API errors array into { fieldName: message } for forms */
function extractFieldErrors(errors?: ApiErrorItem[], message?: string): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const error of errors ?? []) {
    const field = normalizeFieldName(error.field);
    if (field) {
      mapped[field] = error.message;
    }
  }

  if (!message) {
    return mapped;
  }

  const entries = Object.entries(fieldAliasMap);
  for (const [candidate, field] of entries) {
    if (mapped[field]) {
      continue;
    }

    if (message.toLowerCase().includes(candidate)) {
      mapped[field] = message;
    }
  }

  return mapped;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return null;
  }

  return (await response.json()) as ApiResponse<T>;
}

function throwApiError(
  method: string,
  path: string,
  message: string,
  statusCode: number,
  errors: ApiErrorItem[] = [],
  extra?: Record<string, unknown>
): never {
  logFailure("API", message, { method, path, statusCode, ...extra });
  const error = new ApiClientError(message, statusCode, extractFieldErrors(errors, message), errors);
  error.method = method;
  error.path = path;
  error.logged = true;
  throw error;
}

/**
 * Main entry used by all services.
 * @param path  API path starting with /api/...
 * @param options method/body/headers
 * @returns unwrapped `data` from the API envelope
 */
export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: TBody;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  beginApiRequest();
  try {
    return await apiRequestInner<TResponse, TBody>(path, options);
  } finally {
    endApiRequest();
  }
}

async function apiRequestInner<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: TBody;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  const token = getAccessToken();
  const method = options.method ?? "GET";

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throwApiError(method, path, "Unable to reach the server. Please try again.", 0, [], { reason: "network" });
  }

  let payload: ApiResponse<TResponse> | null = null;
  try {
    payload = await parseResponse<TResponse>(response);
  } catch (error) {
    throwApiError(method, path, "The server returned an invalid response.", response.status, [], {
      reason: "parse",
      error: error instanceof Error ? error.message : error
    });
  }

  if (!response.ok || !payload?.success) {
    const fallbackMessage = response.status >= 500
      ? "Something went wrong. Please try again."
      : "Request failed. Please check your input and try again.";

    const apiMessage = payload?.message?.trim();
    const friendlyMessage = response.status >= 500
      ? "Something went wrong. Please try again."
      : (apiMessage || fallbackMessage);

    const statusCode = payload?.statusCode ?? response.status;
    handleUnauthorized(path, statusCode);

    throwApiError(
      method,
      path,
      friendlyMessage,
      statusCode,
      payload?.errors ?? [],
      { traceId: payload?.traceId }
    );
  }

  return payload.data as TResponse;
}

/** Multipart request — do not set Content-Type so the browser can add the boundary. */
export async function apiFormRequest<TResponse>(
  path: string,
  form: FormData,
  method: "POST" | "PUT" = "POST"
): Promise<TResponse> {
  beginApiRequest();
  try {
    return await apiFormRequestInner<TResponse>(path, form, method);
  } finally {
    endApiRequest();
  }
}

async function apiFormRequestInner<TResponse>(
  path: string,
  form: FormData,
  method: "POST" | "PUT" = "POST"
): Promise<TResponse> {
  const token = getAccessToken();

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: form
    });
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throwApiError(method, path, "Unable to reach the server. Please try again.", 0, [], { reason: "network" });
  }

  let payload: ApiResponse<TResponse> | null = null;
  try {
    payload = await parseResponse<TResponse>(response);
  } catch (error) {
    throwApiError(method, path, "The server returned an invalid response.", response.status, [], {
      reason: "parse",
      error: error instanceof Error ? error.message : error
    });
  }

  if (!response.ok || !payload?.success) {
    const apiMessage = payload?.message?.trim();
    const friendlyMessage = response.status >= 500
      ? "Something went wrong. Please try again."
      : (apiMessage || "Request failed. Please check your input and try again.");

    const statusCode = payload?.statusCode ?? response.status;
    handleUnauthorized(path, statusCode);

    throwApiError(
      method,
      path,
      friendlyMessage,
      statusCode,
      payload?.errors ?? [],
      { traceId: payload?.traceId }
    );
  }

  return payload.data as TResponse;
}
