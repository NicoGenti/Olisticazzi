import type { AphorismEntry } from "@/types/oracle";

/**
 * Returns 1-indexed day-of-year for a given Date.
 * Jan 1 = 1, Dec 31 = 365 (or 366 in leap years).
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Deterministic daily aphorism selection.
 * Same date → same aphorism on every device.
 */
export function getDailyAphorism(
  date: Date,
  aphorisms: AphorismEntry[],
): AphorismEntry | null {
  if (aphorisms.length === 0) return null;
  const index = getDayOfYear(date) % aphorisms.length;
  return aphorisms[index];
}
