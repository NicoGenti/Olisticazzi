"use client";

import { useEffect, useState } from "react";

import { useMoodScore, useSetMoodScore } from "@/hooks/useMoodStore";
import { getTodayLog, saveMoodLog } from "@/services/db";
import type { MoodLog } from "@/types/mood";

export type DailySessionState =
  | { status: "loading" }
  | { status: "fresh" }
  | { status: "saved"; log: MoodLog }
  | { status: "editing"; log: MoodLog };

export interface UseDailySessionReturn {
  sessionState: DailySessionState;
  note: string;
  setNote: (note: string) => void;
  saveLog: () => Promise<void>;
  enterEditMode: () => void;
}

function getTodayDateString(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function useDailySession(): UseDailySessionReturn {
  const [sessionState, setSessionState] = useState<DailySessionState>({ status: "loading" });
  const [note, setNote] = useState("");

  const moodScore = useMoodScore();
  const setMoodScore = useSetMoodScore();

  useEffect(() => {
    void getTodayLog()
      .then((existingLog) => {
        if (existingLog) {
          setSessionState({ status: "saved", log: existingLog });
          setNote(existingLog.note ?? "");
          return;
        }

        setSessionState({ status: "fresh" });
      })
      .catch(() => {
        setSessionState({ status: "fresh" });
      });
  }, []);

  async function saveLog() {
    try {
      const savedLog = await saveMoodLog({
        date: getTodayDateString(),
        moodScore,
        note: note.trim() || undefined,
      });

      setSessionState({ status: "saved", log: savedLog });
      setNote(savedLog.note ?? "");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Errore durante il salvataggio del mood log", error);
      }

      throw error;
    }
  }

  function enterEditMode() {
    if (sessionState.status !== "saved" && sessionState.status !== "editing") {
      return;
    }

    setMoodScore(sessionState.log.moodScore);
    setNote(sessionState.log.note ?? "");
    setSessionState({ status: "editing", log: sessionState.log });
  }

  return {
    sessionState,
    note,
    setNote,
    saveLog,
    enterEditMode,
  };
}
