/**
 * Module-level in-flight API counter.
 * apiClient begins/ends around every request so the GlobalLoader can stay in
 * sync even when several calls overlap, and so errors cannot leave it stuck.
 */

type LoadingListener = (activeCount: number) => void;

let activeCount = 0;
const listeners = new Set<LoadingListener>();

function emit(): void {
  const count = activeCount;
  listeners.forEach((listener) => listener(count));
}

export function beginApiRequest(): void {
  activeCount += 1;
  emit();
}

export function endApiRequest(): void {
  activeCount = Math.max(0, activeCount - 1);
  emit();
}

export function getActiveApiRequestCount(): number {
  return activeCount;
}

export function subscribeApiLoading(listener: LoadingListener): () => void {
  listeners.add(listener);
  listener(activeCount);
  return () => {
    listeners.delete(listener);
  };
}
