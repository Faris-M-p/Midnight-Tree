import { useEffect, useState } from "react";
import { subscribeApiLoading } from "../../services/loadingTracker";

/**
 * Single full-screen loader for in-flight API requests.
 * Render once at the app root. No label — the overlay is the signal.
 */
export function GlobalLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeApiLoading((count) => setVisible(count > 0)), []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/70 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className="h-12 w-12 rounded-full border-[3px] border-emerald-400/25 border-t-emerald-400 animate-spin"
        aria-hidden="true"
      />
    </div>
  );
}
