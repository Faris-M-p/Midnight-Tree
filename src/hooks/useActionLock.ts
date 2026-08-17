import { useCallback, useRef, useState } from "react";

/**
 * Synchronous click/submit lock. setState alone is too late to stop a second
 * click in the same frame; the ref blocks that immediately.
 */
export function useActionLock() {
  const lockedRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<void>): Promise<void> => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setIsBusy(true);
    try {
      await action();
    } finally {
      lockedRef.current = false;
      setIsBusy(false);
    }
  }, []);

  return { isBusy, run };
}
