import type { ReactNode } from "react";
import { navigateTo } from "../../routing/navigate";

export function HomeSection({
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className = ""
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actionLabel && actionHref ? (
          <button
            type="button"
            onClick={() => navigateTo(actionHref)}
            className="shrink-0 text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function formatHomeDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
