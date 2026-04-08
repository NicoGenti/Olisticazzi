import { calculateMoodTrend } from "@/services/moodTrend";
import type { MoodLog } from "@/types/mood";
import type { MoodTrend } from "@/types/oracle";
import { toMoodScore } from "@/types/mood";

// Helper to create minimal MoodLog-like objects with just moodScore
function makeLog(score: number): Pick<MoodLog, "moodScore"> {
  return { moodScore: toMoodScore(score) };
}

describe("calculateMoodTrend", () => {
  it("returns 'stable' when there are no historical logs", () => {
    const result: MoodTrend = calculateMoodTrend([], 5);
    expect(result).toBe("stable");
  });

  it("returns 'rising' when today's score is more than 1 above the average", () => {
    // avg = (4+4)/2 = 4, today = 6: 6 > 4+1 = true → rising
    const logs = [makeLog(4), makeLog(4)];
    const result = calculateMoodTrend(logs, 6);
    expect(result).toBe("rising");
  });

  it("returns 'falling' when today's score is more than 1 below the average", () => {
    // avg = (7+7)/2 = 7, today = 5: 5 < 7-1 = true → falling
    const logs = [makeLog(7), makeLog(7)];
    const result = calculateMoodTrend(logs, 5);
    expect(result).toBe("falling");
  });

  it("returns 'stable' when today's score equals the average", () => {
    // avg = (5+5)/2 = 5, today = 5: neither > 6 nor < 4 → stable
    const logs = [makeLog(5), makeLog(5)];
    const result = calculateMoodTrend(logs, 5);
    expect(result).toBe("stable");
  });

  it("returns 'stable' when today exceeds avg by exactly 1 (threshold is >1, not >=1)", () => {
    // avg = 5, today = 6: 6 > 5+1 = 6 > 6 = false → stable (not rising)
    const logs = [makeLog(5)];
    const result = calculateMoodTrend(logs, 6);
    expect(result).toBe("stable");
  });

  it("returns 'rising' when today exceeds avg by more than 1 with single log", () => {
    // avg = 4, today = 7: 7 > 4+1 = 7 > 5 = true → rising
    const logs = [makeLog(4)];
    const result = calculateMoodTrend(logs, 7);
    expect(result).toBe("rising");
  });

  it("uses only the last 3 logs when more are provided (3-day rolling average per D-11)", () => {
    // Pass 5 logs: [1, 1, 1, 8, 8] — last 3 are [1, 8, 8], avg = 17/3 = 5.67
    // If all 5 used: avg = 19/5 = 3.8, today=7: 7 > 3.8+1=4.8 → rising
    // If last 3 used: avg = 5.67, today=7: 7 > 5.67+1=6.67 → rising (7>6.67 true)
    // Use a case that distinguishes: last 3 avg high vs first 2 avg low
    // logs = [2, 2, 7, 7, 7], last3 avg = 7, today = 5: 5 < 7-1=6 → falling
    // If all 5 used: avg = 25/5=5, today=5: stable
    const logs = [makeLog(2), makeLog(2), makeLog(7), makeLog(7), makeLog(7)];
    const result = calculateMoodTrend(logs, 5);
    expect(result).toBe("falling"); // uses last 3: avg=7, 5<6 → falling
  });
});
