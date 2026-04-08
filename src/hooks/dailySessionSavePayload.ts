import type { DailySessionState } from "@/hooks/useDailySession";
import type { MoodEntry, MoodScore } from "@/types/mood";

type DailySessionSavePayload = MoodEntry & { id?: string; createdAt?: number };

export interface BuildDailySessionSavePayloadInput {
  sessionState: DailySessionState;
  date: string;
  moodScore: MoodScore;
  note: string;
}

export function buildDailySessionSavePayload({
  sessionState,
  date,
  moodScore,
  note,
}: BuildDailySessionSavePayloadInput): DailySessionSavePayload {
  const normalizedNote = note.trim() || undefined;

  if (sessionState.status === "editing") {
    return {
      id: sessionState.log.id,
      createdAt: sessionState.log.createdAt,
      date,
      moodScore,
      note: normalizedNote,
    };
  }

  return {
    date,
    moodScore,
    note: normalizedNote,
  };
}
