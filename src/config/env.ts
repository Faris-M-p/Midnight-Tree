/**
 * =============================================================================
 * FILE: src/config/env.ts
 * ROLE: Environment / configuration
 * =============================================================================
 * Reads values from the `.env` file (Vite prefix: VITE_*).
 *
 * Important:
 *   VITE_API_BASE_URL  →  base address of MidnightApi
 *                         example: https://localhost:7187
 *
 * All API services should import `env.apiBaseUrl` instead of hardcoding URLs.
 * =============================================================================
 */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL environment variable.");
}

export const env = {
  /** ASP.NET API root without a trailing slash */
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, "")
};
