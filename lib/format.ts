/**
 * ============================================================================
 * FORMAT — tiny, dependency-free text helpers for live data.
 * ============================================================================
 * Kept separate from the components so the same string can be produced on the
 * server (no hydration mismatch, no Intl payload shipped twice).
 * ============================================================================
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "3 days ago" / "yesterday" / "today" / "2 months ago" — deliberately plain,
 * never "3d" or a timestamp, because the writing voice is a person's.
 */
export function relativeTime(
  iso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;

  const diff = now.getTime() - then.getTime();
  if (diff < 0) return "today"; // clock skew between here and GitHub

  if (diff < DAY) return "today";
  const days = Math.floor(diff / DAY);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "last month";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(days / 365);
  return years <= 1 ? "last year" : `${years} years ago`;
}

/** 1600 → "1.6k". Stars and commits stay readable in a card corner. */
export function compact(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}

/** "Aug 2026" — for the rare place a fixed date reads better than a duration. */
export function monthYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** Deterministic small rotation so repeated cards never look machine-aligned. */
export function tiltFor(seed: string, max = 0.7): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return ((h / 997) * 2 - 1) * max;
}
