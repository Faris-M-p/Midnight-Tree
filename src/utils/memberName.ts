/** Stored only because the API still requires last name. Never show this in the UI. */
export const HIDDEN_LAST_NAME = "-";

/** Visible name is first name only. Nickname is shown separately. */
export function memberDisplayName(person?: {
  firstName?: string | null;
  fullName?: string | null;
  name?: string | null;
} | null): string {
  const first = person?.firstName?.trim();
  if (first) return first;

  const fallback = person?.fullName?.trim() || person?.name?.trim() || "";
  return fallback.split(/\s+/).filter(Boolean)[0] || fallback;
}
