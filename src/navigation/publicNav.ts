export interface PublicNavItem {
  href: string;
  label: string;
  key: "home" | "features" | "about" | "login";
}

export const publicNavItems: PublicNavItem[] = [
  { href: "/", label: "Home", key: "home" },
  { href: "/features", label: "Features", key: "features" },
  { href: "/about", label: "About", key: "about" },
  { href: "/login", label: "Login", key: "login" }
];

export function isPublicNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
