import type { ReactNode } from "react";

const sizeClass = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
  lg: "h-12 w-12 border-[3px]"
} as const;

export function RoundSpinner({
  size = "md",
  className = "border-current border-t-transparent"
}: {
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full ${sizeClass[size]} ${className}`}
      aria-hidden="true"
    />
  );
}

export function BusyContent({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      {busy ? <RoundSpinner /> : null}
      {children}
    </span>
  );
}
