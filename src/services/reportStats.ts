import type { MoodLog } from "@/types/mood";
import type { MoodTrend } from "@/types/oracle";
import { calculateMoodTrend } from "@/services/moodTrend";

export type Range = "7" | "30" | "90" | "all";

export interface ReportStats {
  totalLogs: number;
  avgScore: number;
  trend: MoodTrend;
  positiveStreak: number;
  negativeStreak: number;
  highestScore: number;
  lowestScore: number;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(a: Date, b: Date): number {
  const diffMs = Math.abs(a.getTime() - b.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function sortByDateAscending(logs: MoodLog[]): MoodLog[] {
  return [...logs].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
}

function sortByDateDescending(logs: MoodLog[]): MoodLog[] {
  return [...logs].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
}

export function filterLogsByRange(logs: MoodLog[], range: Range): MoodLog[] {
  if (range === "all") {
    return sortByDateDescending(logs);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysToSubtract = parseInt(range, 10);
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);

  const filtered = logs.filter((log) => {
    const logDate = parseDate(log.date);
    return logDate >= cutoffDate;
  });

  return sortByDateDescending(filtered);
}

function computeStreak(logs: MoodLog[], predicate: (score: number) => boolean): number {
  if (logs.length === 0) return 0;

  const sorted = sortByDateAscending(logs);
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const log of sorted) {
    const score = Number(log.moodScore);
    if (!predicate(score)) {
      currentStreak = 0;
      prevDate = null;
      continue;
    }

    const logDate = parseDate(log.date);

    if (prevDate === null) {
      currentStreak = 1;
    } else {
      const diff = daysBetween(logDate, prevDate);
      if (diff === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    prevDate = logDate;
  }

  return maxStreak;
}

function calculatePositiveStreak(logs: MoodLog[]): number {
  return computeStreak(logs, (score) => score >= 7);
}

function calculateNegativeStreak(logs: MoodLog[]): number {
  return computeStreak(logs, (score) => score <= 3);
}

export function computeStatsForRange(logs: MoodLog[]): ReportStats {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      avgScore: 0,
      trend: "stable",
      positiveStreak: 0,
      negativeStreak: 0,
      highestScore: 0,
      lowestScore: 0,
    };
  }

  const scores = logs.map((log) => Number(log.moodScore));
  const totalLogs = logs.length;
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / totalLogs;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  const sortedDesc = sortByDateDescending(logs);
  const mostRecentScore = Number(sortedDesc[0].moodScore);
  const historicalLogs = sortedDesc.slice(1);
  const trend = calculateMoodTrend(historicalLogs, mostRecentScore);

  const positiveStreak = calculatePositiveStreak(logs);
  const negativeStreak = calculateNegativeStreak(logs);

  return {
    totalLogs,
    avgScore: Math.round(avgScore * 100) / 100,
    trend,
    positiveStreak,
    negativeStreak,
    highestScore,
    lowestScore,
  };
}
