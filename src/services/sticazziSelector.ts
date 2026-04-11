import type { SticazziEntry } from "@/types/oracle";
import { getDayOfYear } from "./aphorismSelector";

/**
 * Deterministic daily sticazzi selection.
 * Same date → same sticazzi on every device.
 */
export function getDailySticazzi(
  date: Date,
  sticazzi: SticazziEntry[],
): SticazziEntry | null {
  if (sticazzi.length === 0) return null;
  const index = getDayOfYear(date) % sticazzi.length;
  return sticazzi[index];
}
