import {
  BookOpen,
  CalendarDays,
  Clock3,
  GitBranch,
  Home,
  Image,
  KeyRound,
  LogOut,
  TreePine,
  Users,
  type LucideIcon
} from "lucide-react";

export type AppNavSection = "main" | "admin" | "bottom";

export interface AppNavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  section: AppNavSection;
  requiresAdmin?: boolean;
  action?: "logout";
}

export const appNavItems: AppNavItem[] = [
  { href: "/home", label: "Home", icon: Home, section: "main" },
  { href: "/family", label: "Family", icon: TreePine, section: "main" },
  { href: "/members", label: "Members", icon: Users, section: "main" },
  { href: "/family-tree", label: "Family Tree", icon: GitBranch, section: "main" },
  { href: "/stories", label: "Stories", icon: BookOpen, section: "main" },
  { href: "/gallery", label: "Gallery", icon: Image, section: "main" },
  { href: "/timeline", label: "Timeline", icon: Clock3, section: "main" },
  { href: "/events", label: "Events", icon: CalendarDays, section: "main" },
  { href: "/access-tokens", label: "Access Tokens", icon: KeyRound, section: "admin", requiresAdmin: true },
  { label: "Logout", icon: LogOut, section: "bottom", action: "logout" }
];

export function isAppNavActive(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}
