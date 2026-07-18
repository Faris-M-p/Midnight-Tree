import { env } from "../config/env";
import type { ApiErrorItem, ApiResponse } from "../types/api";

export class ApiClientError extends Error {
  statusCode: number;
  fieldErrors: Record<string, string>;
  errors: ApiErrorItem[];

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

const fieldAliasMap: Record<string, string> = {
  username: "username",
  email: "email",
  password: "password",
  "confirm password": "confirmPassword",
  "family code": "familyCode",
  "family name": "familyName",
  description: "description"
};

function normalizeFieldName(field?: string | null): string | null {
  if (!field) {
    return null;
  }

  const normalized = field.trim().toLowerCase();
  return fieldAliasMap[normalized] ?? normalized;
}

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

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: TBody;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await parseResponse<TResponse>(response);

  if (!response.ok || !payload?.success) {
    const fallbackMessage = response.status >= 500
      ? "Something went wrong. Please try again."
      : "Request failed. Please check your input and try again.";

    const apiMessage = payload?.message?.trim();
    const friendlyMessage = response.status >= 500
      ? "Something went wrong. Please try again."
      : (apiMessage || fallbackMessage);

    throw new ApiClientError(
      friendlyMessage,
      payload?.statusCode ?? response.status,
      extractFieldErrors(payload?.errors, apiMessage),
      payload?.errors ?? []
    );
  }

  return payload.data as TResponse;
}
