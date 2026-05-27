import { getDisplayName } from './auth';

const storageKey = (userId) => `trip_title_${userId}`;

export function getDefaultTripTitle(user) {
  const name = getDisplayName(user);
  return `${name}'s Experiential Learning Trip`;
}

export function loadTripTitle(user) {
  if (!user?.id) return getDefaultTripTitle(user);
  try {
    const saved = localStorage.getItem(storageKey(user.id));
    return saved || getDefaultTripTitle(user);
  } catch {
    return getDefaultTripTitle(user);
  }
}

export function saveTripTitle(userId, title) {
  if (!userId || !title?.trim()) return;
  localStorage.setItem(storageKey(userId), title.trim());
}
