const CARTOON_AVATARS = {
  male: "/avatars/male.png",
  female: "/avatars/female.png",
  other: "/avatars/other.png"
} as const;

const OLD_DUMMY_AVATAR_MARKERS = [
  "photo-1500648767791-00dcc994a43e",
  "photo-1494790108377-be9c29b29330",
  "photo-1524504388940-b1c1722653e1"
];

function isOldDummyAvatar(url: string): boolean {
  return OLD_DUMMY_AVATAR_MARKERS.some((marker) => url.includes(marker));
}

/** Cartoon placeholders used when a member has no profile photo. */
export function defaultAvatar(gender: "male" | "female" | "other" = "male"): string {
  if (gender === "female") return CARTOON_AVATARS.female;
  if (gender === "other") return CARTOON_AVATARS.other;
  return CARTOON_AVATARS.male;
}

export function resolveAvatarUrl(
  avatar: string | undefined | null,
  gender: "male" | "female" | "other" = "male"
): string {
  const trimmed = avatar?.trim();
  if (!trimmed || isOldDummyAvatar(trimmed)) return defaultAvatar(gender);
  return trimmed;
}
