/**
 * =============================================================================
 * FILE: src/types/api.ts
 * ROLE: Shared API envelope types
 * =============================================================================
 * MidnightApi returns a common wrapper for almost every endpoint:
 *
 *   {
 *     success: true/false,
 *     statusCode: 200,
 *     message: "...",
 *     data: { ... },
 *     errors: [ { field, message } ]
 *   }
 *
 * These interfaces describe that wrapper so TypeScript can check our code.
 * =============================================================================
 */

/** One validation / business error from the API */
export interface ApiErrorItem {
  code: string;
  message: string;
  field?: string | null;
}

/** Standard success/error envelope used by MidnightApi */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  developerMessage?: string;
  data?: T;
  errors?: ApiErrorItem[];
  traceId?: string;
}
