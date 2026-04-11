import { describe, expect, it } from "@jest/globals";

import { filterLogsByRange, computeStatsForRange } from "@/services/reportStats";
import type { MoodLog } from "@/types/mood";
import { toMoodScore } from "@/types/mood";

function makeLog(date: string, score: number): MoodLog {
  return {
    id: `log-${date}`,
    date,
    moodScore: toMoodScore(score),
    createdAt: Date.now(),
  };
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("filterLogsByRange", () => {
  it("returns empty array for empty input", () => {
    const result = filterLogsByRange([], "7");
    expect(result).toEqual([]);
  });

  it('range="all" returns all logs sorted descending', () => {
    const logs = [makeLog("2026-04-01", 5), makeLog("2026-04-10", 7), makeLog("2026-04-05", 6)];
    const result = filterLogsByRange(logs, "all");
    expect(result.map((l) => l.date)).toEqual(["2026-04-10", "2026-04-05", "2026-04-01"]);
  });

  it('range="7" returns logs from the last 7 days only', () => {
    const logs = [makeLog(daysAgo(3), 5), makeLog(daysAgo(10), 7), makeLog(daysAgo(6), 6), makeLog(daysAgo(0), 8)];
    const result = filterLogsByRange(logs, "7");
    expect(result.length).toBe(3);
    expect(result.map((l) => l.date).sort()).toEqual([daysAgo(6), daysAgo(3), daysAgo(0)]);
  });

  it('range="30" returns logs from the last 30 days', () => {
    const logs = [makeLog(daysAgo(5), 5), makeLog(daysAgo(45), 7)];
    const result = filterLogsByRange(logs, "30");
    expect(result.length).toBe(1);
    expect(result[0].date).toBe(daysAgo(5));
  });

  it('range="90" returns logs from the last 90 days', () => {
    const logs = [makeLog(daysAgo(10), 5), makeLog(daysAgo(100), 7)];
    const result = filterLogsByRange(logs, "90");
    expect(result.length).toBe(1);
    expect(result[0].date).toBe(daysAgo(10));
  });

  it("sorts filtered results by date descending", () => {
    const logs = [makeLog(daysAgo(2), 5), makeLog(daysAgo(1), 7), makeLog(daysAgo(3), 6)];
    const result = filterLogsByRange(logs, "7");
    expect(result.map((l) => l.date)).toEqual([daysAgo(1), daysAgo(2), daysAgo(3)]);
  });
});

describe("computeStatsForRange", () => {
  it("returns zero stats for empty array", () => {
    const result = computeStatsForRange([]);
    expect(result.totalLogs).toBe(0);
    expect(result.avgScore).toBe(0);
    expect(result.trend).toBe("stable");
    expect(result.positiveStreak).toBe(0);
    expect(result.negativeStreak).toBe(0);
    expect(result.highestScore).toBe(0);
    expect(result.lowestScore).toBe(0);
  });

  it("computes correct stats for single log with score >= 7", () => {
    const logs = [makeLog(daysAgo(0), 8)];
    const result = computeStatsForRange(logs);
    expect(result.totalLogs).toBe(1);
    expect(result.avgScore).toBe(8);
    expect(result.highestScore).toBe(8);
    expect(result.lowestScore).toBe(8);
    expect(result.positiveStreak).toBe(1);
    expect(result.negativeStreak).toBe(0);
  });

  it("computes correct stats for single log with score <= 3", () => {
    const logs = [makeLog(daysAgo(0), 2)];
    const result = computeStatsForRange(logs);
    expect(result.totalLogs).toBe(1);
    expect(result.avgScore).toBe(2);
    expect(result.positiveStreak).toBe(0);
    expect(result.negativeStreak).toBe(1);
  });

  it("computes correct stats for single log with neutral score", () => {
    const logs = [makeLog(daysAgo(0), 5)];
    const result = computeStatsForRange(logs);
    expect(result.totalLogs).toBe(1);
    expect(result.positiveStreak).toBe(0);
    expect(result.negativeStreak).toBe(0);
  });

  it("computes average correctly for multiple logs", () => {
    const logs = [makeLog(daysAgo(0), 6), makeLog(daysAgo(1), 8), makeLog(daysAgo(2), 4)];
    const result = computeStatsForRange(logs);
    expect(result.avgScore).toBe(6);
    expect(result.totalLogs).toBe(3);
  });

  it("computes highest and lowest scores correctly", () => {
    const logs = [makeLog(daysAgo(0), 3), makeLog(daysAgo(1), 9), makeLog(daysAgo(2), 5)];
    const result = computeStatsForRange(logs);
    expect(result.highestScore).toBe(9);
    expect(result.lowestScore).toBe(3);
  });

  it("calculates positiveStreak for consecutive days with score >= 7", () => {
    const logs = [
      makeLog(daysAgo(3), 5),
      makeLog(daysAgo(2), 7),
      makeLog(daysAgo(1), 8),
      makeLog(daysAgo(0), 6),
    ];
    const result = computeStatsForRange(logs);
    expect(result.positiveStreak).toBe(2);
  });

  it("calculates positiveStreak as 1 when only one day qualifies", () => {
    const logs = [makeLog(daysAgo(0), 7)];
    const result = computeStatsForRange(logs);
    expect(result.positiveStreak).toBe(1);
  });

  it("calculates negativeStreak for consecutive days with score <= 3", () => {
    const logs = [
      makeLog(daysAgo(3), 5),
      makeLog(daysAgo(2), 3),
      makeLog(daysAgo(1), 2),
      makeLog(daysAgo(0), 4),
    ];
    const result = computeStatsForRange(logs);
    expect(result.negativeStreak).toBe(2);
  });

  it("streak breaks when days are not consecutive", () => {
    const logs = [
      makeLog(daysAgo(5), 8),
      makeLog(daysAgo(3), 9),
      makeLog(daysAgo(2), 7),
    ];
    const result = computeStatsForRange(logs);
    expect(result.positiveStreak).toBe(2);
  });

  it("returns trend 'stable' with single log", () => {
    const logs = [makeLog(daysAgo(0), 5)];
    const result = computeStatsForRange(logs);
    expect(result.trend).toBe("stable");
  });

  it("calculates trend as 'rising' when most recent is higher than historical average", () => {
    const logs = [
      makeLog(daysAgo(2), 4),
      makeLog(daysAgo(1), 4),
      makeLog(daysAgo(0), 8),
    ];
    const result = computeStatsForRange(logs);
    expect(result.trend).toBe("rising");
  });

  it("calculates trend as 'falling' when most recent is lower than historical average", () => {
    const logs = [
      makeLog(daysAgo(2), 8),
      makeLog(daysAgo(1), 8),
      makeLog(daysAgo(0), 4),
    ];
    const result = computeStatsForRange(logs);
    expect(result.trend).toBe("falling");
  });

  it("handles non-consecutive dates correctly in streak calculation", () => {
    const logs = [
      makeLog(daysAgo(6), 8),
      makeLog(daysAgo(4), 9),
      makeLog(daysAgo(3), 7),
      makeLog(daysAgo(2), 6),
    ];
    const result = computeStatsForRange(logs);
    expect(result.positiveStreak).toBe(2);
  });
});
