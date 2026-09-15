/**
 * Legacy HTTP helper — kept only so existing `ApiClientError` catch blocks compile.
 * This file never contacts MidnightApi.
 */

import type { ApiErrorItem } from "../types/api";

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

function unusedApi(): never {
  const error = new ApiClientError("This app uses Firebase only.", 0);
  error.method = "GET";
  error.path = "";
  throw error;
}

export async function apiRequest<TResponse = never, TBody = unknown>(
  _path?: string,
  _options?: { method?: string; body?: TBody; trackLoading?: boolean }
): Promise<TResponse> {
  unusedApi();
}

export async function apiFormRequest<TResponse = never>(
  _path?: string,
  _form?: FormData,
  _method?: string
): Promise<TResponse> {
  unusedApi();
}
