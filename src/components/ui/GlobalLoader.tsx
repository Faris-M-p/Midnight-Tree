import { useEffect, useState } from "react";
import { subscribeApiLoading } from "../../services/loadingTracker";
import { RoundSpinner } from "./RoundSpinner";

/**
 * Single full-screen round loader for in-flight create / update / delete.
 * Render once at the app root. No label — the overlay is the signal.
 */
export function GlobalLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeApiLoading((count) => setVisible(count > 0)), []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-overlay backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <RoundSpinner size="lg" className="border-accent/25 border-t-accent" />
    </div>
  );
}
