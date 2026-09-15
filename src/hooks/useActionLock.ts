import { useCallback, useRef, useState } from "react";
import { beginApiRequest, endApiRequest } from "../services/loadingTracker";

/**
 * Synchronous click/submit lock. setState alone is too late to stop a second
 * click in the same frame; the ref blocks that immediately.
 * Also drives the shared round GlobalLoader overlay.
 */
export function useActionLock() {
  const lockedRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<void>): Promise<void> => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setIsBusy(true);
    beginApiRequest();
    try {
      await action();
    } finally {
      lockedRef.current = false;
      setIsBusy(false);
      endApiRequest();
    }
  }, []);

  return { isBusy, run };
}
