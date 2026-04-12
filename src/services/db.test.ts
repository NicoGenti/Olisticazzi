import "fake-indexeddb/auto";
import { describe, beforeEach, expect, it } from "@jest/globals";

import { toMoodScore } from "@/types/mood";
import { db, dedupeDailyLogs, getAllLogs, getRecentLogs, getTodayLog, saveMoodLog } from "./db";

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

  it("returns the most recent log when duplicate same-day rows exist", async () => {
    const today = new Date().toLocaleDateString("sv-SE");

    const older = await saveMoodLog({ date: today, moodScore: toMoodScore(2), note: "older" });
    const newer = await saveMoodLog({
      date: today,
      moodScore: toMoodScore(9),
      note: "newer",
      createdAt: older.createdAt + 1000,
    });

    const log = await getTodayLog();

    expect(log).not.toBeNull();
    expect(log?.id).toBe(newer.id);
    expect(log?.moodScore).toBe(9);
    expect(log?.note).toBe("newer");
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

describe("getRecentLogs", () => {
  it("returns logs with date strictly before the cutoff", async () => {
    await saveMoodLog({ date: "2026-01-01", moodScore: toMoodScore(5), createdAt: 1000 });
    await saveMoodLog({ date: "2026-01-02", moodScore: toMoodScore(6), createdAt: 2000 });
    await saveMoodLog({ date: "2026-01-03", moodScore: toMoodScore(7), createdAt: 3000 });

    const logs = await getRecentLogs("2026-01-03", 10);

    expect(logs.map((l) => l.date)).not.toContain("2026-01-03");
    expect(logs.map((l) => l.date)).toContain("2026-01-02");
    expect(logs.map((l) => l.date)).toContain("2026-01-01");
  });

  it("respects the limit parameter", async () => {
    await saveMoodLog({ date: "2026-01-01", moodScore: toMoodScore(5), createdAt: 1000 });
    await saveMoodLog({ date: "2026-01-02", moodScore: toMoodScore(6), createdAt: 2000 });
    await saveMoodLog({ date: "2026-01-03", moodScore: toMoodScore(7), createdAt: 3000 });

    const logs = await getRecentLogs("2026-01-10", 2);

    expect(logs).toHaveLength(2);
  });

  it("returns empty array when no logs exist before cutoff", async () => {
    await saveMoodLog({ date: "2026-01-05", moodScore: toMoodScore(5), createdAt: 1000 });

    const logs = await getRecentLogs("2026-01-05", 10);

    expect(logs).toHaveLength(0);
  });
});

describe("dedupeDailyLogs", () => {
  it("removes duplicate rows for same date keeping most recent", async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    await saveMoodLog({
      date: today,
      moodScore: toMoodScore(2),
      note: "older",
      id: "11111111-1111-4111-8111-111111111111",
      createdAt: 1000,
    });
    await saveMoodLog({
      date: today,
      moodScore: toMoodScore(9),
      note: "newer",
      id: "22222222-2222-4222-8222-222222222222",
      createdAt: 2000,
    });
    await saveMoodLog({
      date: "2026-01-01",
      moodScore: toMoodScore(5),
      id: "33333333-3333-4333-8333-333333333333",
      createdAt: 1500,
    });

    const before = await getAllLogs();
    expect(before.filter((log) => log.date === today)).toHaveLength(2);

    const removed = await dedupeDailyLogs();

    expect(removed).toBe(1);

    const logs = await getAllLogs();
    expect(logs).toHaveLength(2);

    const todayLogs = logs.filter((log) => log.date === today);
    expect(todayLogs).toHaveLength(1);
    expect(todayLogs[0].moodScore).toBe(9);
    expect(todayLogs[0].note).toBe("newer");
  });

  it("returns zero when no duplicates exist", async () => {
    const today = new Date().toLocaleDateString("sv-SE");
    await saveMoodLog({
      date: today,
      moodScore: toMoodScore(6),
      id: "44444444-4444-4444-8444-444444444444",
      createdAt: 3000,
    });
    await saveMoodLog({
      date: "2026-01-01",
      moodScore: toMoodScore(4),
      id: "55555555-5555-4555-8555-555555555555",
      createdAt: 2500,
    });

    const removed = await dedupeDailyLogs();

    expect(removed).toBe(0);
    const logs = await getAllLogs();
    expect(logs).toHaveLength(2);
  });
});
