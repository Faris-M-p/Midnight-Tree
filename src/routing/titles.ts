import { matchPath } from "./navigate";

const titles: Array<[string, string]> = [
  ["/home", "Home"],
  ["/family/edit", "Edit Family"],
  ["/family", "Family"],
  ["/members/new", "Add Member"],
  ["/members/:id/edit", "Edit Member"],
  ["/members/:id", "Member Details"],
  ["/members", "Members"],
  ["/family-tree", "Family Tree"],
  ["/memories/create", "Create Memory"],
  ["/memories/:id/edit", "Edit Memory"],
  ["/memories/:id", "Memory"],
  ["/memories", "Memories"],
  ["/timeline", "Timeline"],
  ["/events/create", "Create Event"],
  ["/events/:id/edit", "Edit Event"],
  ["/events/:id", "Event"],
  ["/events", "Events"],
  ["/access-tokens/generate", "Generate Token"],
  ["/access-tokens/:id/activity", "Token Activity"],
  ["/access-tokens/:id/edit", "Edit Token"],
  ["/access-tokens/:id", "Token Details"],
  ["/access-tokens", "Access Tokens"]
];

export function getPageTitle(pathname: string) {
  for (const [pattern, title] of titles) {
    if (matchPath(pattern, pathname)) return title;
  }
  return "Midnight Chronicle";
}

export function isTreePath(pathname: string) {
  return pathname === "/family-tree" || pathname === "/tree";
}
