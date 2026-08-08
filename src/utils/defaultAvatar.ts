/** Standard gender-based placeholder portraits used when no avatar URL is provided. */
export function defaultAvatar(gender: 'male' | 'female' | 'other' = 'male'): string {
  if (gender === 'female') {
    return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80';
  }
  if (gender === 'other') {
    return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces&q=80';
  }
  return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80';
}

export function resolveAvatarUrl(
  avatar: string | undefined | null,
  gender: 'male' | 'female' | 'other' = 'male'
): string {
  const trimmed = avatar?.trim();
  return trimmed || defaultAvatar(gender);
}
