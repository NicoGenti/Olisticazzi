import type { MoodLog } from "@/types/mood";
import type { MoodTrend } from "@/types/oracle";

/**
 * Calculates the mood trend based on the last 3 historical mood logs compared
 * to today's score, per D-11 specification:
 *
 * - Uses a 3-day rolling average of the most recent logs
 * - If today > avg + 1: "rising"
 * - If today < avg - 1: "falling"
 * - Otherwise: "stable"
 *
 * Pure TypeScript — no React imports. Safe for React Native portability.
 */
export function calculateMoodTrend(
  recentLogs: Pick<MoodLog, "moodScore">[],
  todayScore: number
): MoodTrend {
  if (recentLogs.length === 0) return "stable";

  // Use only the last 3 logs (D-11: 3-day rolling average)
  const last3 = recentLogs.slice(-3);
  const avg = last3.reduce((sum, l) => sum + l.moodScore, 0) / last3.length;

  if (todayScore > avg + 1) return "rising";
  if (todayScore < avg - 1) return "falling";
  return "stable";
}
