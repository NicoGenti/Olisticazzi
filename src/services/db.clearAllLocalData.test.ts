import "fake-indexeddb/auto";
import { describe, beforeEach, expect, it } from "@jest/globals";

import { toMoodScore } from "@/types/mood";
import { clearAllLocalData, db, getAllLogs, saveMoodLog } from "./db";

beforeEach(async () => {
  await db.dailyLogs.clear();
  localStorage.removeItem("moonmood_logs");
});

describe("clearAllLocalData", () => {
  it("removes all Dexie daily logs", async () => {
    await saveMoodLog({ date: "2026-04-07", moodScore: toMoodScore(7), note: "test" });
    await saveMoodLog({ date: "2026-04-08", moodScore: toMoodScore(5) });

    const before = await getAllLogs();
    expect(before.length).toBe(2);

    await clearAllLocalData();

    const after = await getAllLogs();
    expect(after).toEqual([]);
  });

  it("removes localStorage fallback payload", async () => {
    localStorage.setItem("moonmood_logs", JSON.stringify([{ fake: true }]));
    expect(localStorage.getItem("moonmood_logs")).not.toBeNull();

    await clearAllLocalData();

    expect(localStorage.getItem("moonmood_logs")).toBeNull();
  });
});
