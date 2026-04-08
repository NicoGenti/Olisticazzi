import { describe, expect, it } from "@jest/globals";

import type { DailySessionState } from "@/hooks/useDailySession";
import { buildDailySessionSavePayload } from "@/hooks/dailySessionSavePayload";
import { toMoodScore, type MoodLog } from "@/types/mood";

describe("buildDailySessionSavePayload", () => {
  it("uses current mood/note/date without identity fields in fresh mode", () => {
    const sessionState: DailySessionState = { status: "fresh" };

    const payload = buildDailySessionSavePayload({
      sessionState,
      date: "2026-04-08",
      moodScore: toMoodScore(7),
      note: "new note",
    });

    expect(payload).toEqual({
      date: "2026-04-08",
      moodScore: 7,
      note: "new note",
    });
    expect(payload).not.toHaveProperty("id");
    expect(payload).not.toHaveProperty("createdAt");
  });

  it("keeps id/createdAt and applies updated mood/note in editing mode", () => {
    const existingLog: MoodLog = {
      id: "88f4e355-a31d-4f3f-b3c3-b0ae7fc3f7c0",
      date: "2026-04-08",
      createdAt: 1712550000000,
      moodScore: toMoodScore(3),
      note: "old note",
    };
    const sessionState: DailySessionState = { status: "editing", log: existingLog };

    const payload = buildDailySessionSavePayload({
      sessionState,
      date: "2026-04-08",
      moodScore: toMoodScore(9),
      note: "updated note",
    });

    expect(payload).toEqual({
      id: existingLog.id,
      createdAt: existingLog.createdAt,
      date: "2026-04-08",
      moodScore: 9,
      note: "updated note",
    });
  });

  it("normalizes empty or whitespace note to undefined", () => {
    const fresh: DailySessionState = { status: "fresh" };
    const existingLog: MoodLog = {
      id: "e334ce75-fb1b-4f73-bf34-a8949496772d",
      date: "2026-04-08",
      createdAt: 1712550001234,
      moodScore: toMoodScore(6),
    };
    const editing: DailySessionState = { status: "editing", log: existingLog };

    const freshPayload = buildDailySessionSavePayload({
      sessionState: fresh,
      date: "2026-04-08",
      moodScore: toMoodScore(6),
      note: "   ",
    });

    const editingPayload = buildDailySessionSavePayload({
      sessionState: editing,
      date: "2026-04-08",
      moodScore: toMoodScore(6),
      note: "",
    });

    expect(freshPayload.note).toBeUndefined();
    expect(editingPayload.note).toBeUndefined();
  });
});
