export type MoodScore = number & { readonly __brand: "MoodScore" };

export function toMoodScore(value: number): MoodScore {
  if (value < 0 || value > 10) {
    throw new Error(`Invalid mood score: ${value}`);
  }

  return value as MoodScore;
}

export interface MoodLog {
  id: string;
  date: string;
  moodScore: MoodScore;
  note?: string;
  createdAt: number;
}

export type MoodEntry = Omit<MoodLog, "id" | "createdAt">;
