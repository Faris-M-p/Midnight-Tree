/**
 * Lightweight History API navigation — same convention as the original App router,
 * extended to support the full authenticated route tree.
 */

export function navigateTo(path: string) {
  const next = path.startsWith("/") ? path : `/${path}`;
  if (window.location.pathname + window.location.search === next) return;
  window.history.pushState({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function matchPath(
  pattern: string,
  pathname: string
): { params: Record<string, string> } | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i];
    const value = pathParts[i];
    if (part.startsWith(":")) {
      params[part.slice(1)] = decodeURIComponent(value);
      continue;
    }
    if (part !== value) return null;
  }
  return { params };
}

export function usePathname(pathname: string, patterns: string[]): string | null {
  for (const pattern of patterns) {
    if (matchPath(pattern, pathname)) return pattern;
  }
  return null;
}
