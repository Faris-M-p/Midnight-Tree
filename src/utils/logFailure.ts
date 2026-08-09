type LoggedApiError = {
  message: string;
  statusCode?: number;
  method?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
  errors?: unknown[];
  logged?: boolean;
};

function isLoggedApiError(error: unknown): error is LoggedApiError {
  return Boolean(error && typeof error === "object" && "message" in error && "statusCode" in error);
}

export function logFailure(scope: string, error: unknown, extra?: Record<string, unknown>) {
  const details: Record<string, unknown> = { ...extra };

  if (isLoggedApiError(error)) {
    details.message = error.message;
    details.statusCode = error.statusCode;
    if (error.method) details.method = error.method;
    if (error.path) details.path = error.path;
    if (error.fieldErrors && Object.keys(error.fieldErrors).length) details.fieldErrors = error.fieldErrors;
    if (error.errors?.length) details.errors = error.errors;
  } else if (error instanceof Error) {
    details.name = error.name;
    details.message = error.message;
  } else if (typeof error === "string") {
    details.message = error;
  } else if (error != null) {
    details.error = error;
  }

  console.error(`[${scope}] failed`, details);
}

/** Skip if apiClient already logged this request failure. */
export function logUnexpected(scope: string, error: unknown, extra?: Record<string, unknown>) {
  if (isLoggedApiError(error) && error.logged) return;
  logFailure(scope, error, extra);
}
