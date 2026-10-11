export function relativeTime(at: number): string {
  const diff = Math.max(0, Date.now() - at);
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

/** "12 Oct 2026" — calendar dates for things like a deletion date. */
export function formatDay(at: number): string {
  return new Date(at).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/** Whole days from now until `at`, never negative. */
export function daysUntil(at: number): number {
  return Math.max(0, Math.ceil((at - Date.now()) / (24 * 60 * 60 * 1000)));
}