import "fake-indexeddb/auto";
import { describe, beforeEach, expect, it } from "@jest/globals";

import { toMoodScore } from "@/types/mood";
import { db, getAllLogs, getTodayLog, saveMoodLog } from "./db";

beforeEach(async () => {
  await db.dailyLogs.clear();
  localStorage.removeItem("moonmood_logs");
});

describe("saveMoodLog", () => {
  it("persists a log and returns it with id and createdAt", async () => {
    const entry = { date: "2026-04-07", moodScore: toMoodScore(7), note: "test" };
    const saved = await saveMoodLog(entry);

    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeGreaterThan(0);
    expect(saved.moodScore).toBe(7);
  });

  it("rejects invalid mood score via Zod", async () => {
    await expect(saveMoodLog({ date: "2026-04-07", moodScore: 11 as never })).rejects.toThrow();
  });
});

describe("getTodayLog", () => {
  it("returns the log for today", async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    await saveMoodLog({ date: today, moodScore: toMoodScore(5) });

    const log = await getTodayLog();

    expect(log).not.toBeNull();
    expect(log?.date).toBe(today);
  });

  it("returns null when no log exists for today", async () => {
    await saveMoodLog({ date: "2026-01-01", moodScore: toMoodScore(4) });

    const log = await getTodayLog();

    expect(log).toBeNull();
  });
});

describe("getAllLogs", () => {
  it("returns logs sorted newest first", async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    await saveMoodLog({ date: today, moodScore: toMoodScore(3) });
    await saveMoodLog({ date: "2026-01-01", moodScore: toMoodScore(8) });

    const logs = await getAllLogs();

    expect(logs.length).toBe(2);
    expect(logs[0].createdAt).toBeGreaterThanOrEqual(logs[1].createdAt);
  });
});
