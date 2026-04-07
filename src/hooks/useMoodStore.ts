import { create } from "zustand";

import type { MoodScore } from "@/types/mood";
import { toMoodScore } from "@/types/mood";

interface MoodStoreState {
  moodScore: MoodScore;
  setMoodScore: (score: number) => void;
}

export const useMoodStore = create<MoodStoreState>((set) => ({
  moodScore: toMoodScore(5),
  setMoodScore: (score: number) => set({ moodScore: toMoodScore(score) })
}));

export const useMoodScore = () => useMoodStore((state) => state.moodScore);
export const useSetMoodScore = () => useMoodStore((state) => state.setMoodScore);
