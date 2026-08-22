function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function utcIsoToLocalParts(iso?: string | null): {
  date: string;
  hour12: number;
  minute: number;
  period: "AM" | "PM";
} {
  const fallback = new Date();
  const date = iso ? new Date(iso) : fallback;
  const safe = Number.isNaN(date.getTime()) ? fallback : date;
  const hours24 = safe.getHours();
  const period: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return {
    date: toDateInput(safe),
    hour12,
    minute: safe.getMinutes(),
    period
  };
}

export function localPartsToUtcIso(
  date: string,
  hour12: number,
  minute: number,
  period: "AM" | "PM"
): string {
  const [y, m, d] = date.split("-").map(Number);
  let hours24 = hour12 % 12;
  if (period === "PM") hours24 += 12;
  const local = new Date(y, (m || 1) - 1, d || 1, hours24, minute, 0, 0);
  return local.toISOString();
}

export function formatEventDateTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export function isEventUpcoming(eventDateTime?: string | null): boolean {
  if (!eventDateTime) return false;
  const time = new Date(eventDateTime).getTime();
  return Number.isFinite(time) && time >= Date.now();
}

export function truncateEventText(value: string | null | undefined, max = 120): string {
  const text = (value ?? "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
