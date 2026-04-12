"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useMoodScore, useSetMoodScore } from "@/hooks/useMoodStore";
import { buildDailySessionSavePayload } from "@/hooks/dailySessionSavePayload";
import { getTodayLog, saveMoodLog, getRecentLogs } from "@/services/db";
import { getTodayDateString } from "@/lib/date";
import { getMoonPhase } from "@/services/moonPhase";
import { calculateMoodTrend } from "@/services/moodTrend";
import { selectOracle } from "@/services/oracleEngine";
import oracleCardsRaw from "@/data/oracle_seed.json";
import remediesRaw from "@/data/remedies_seed.json";
import type { OracleCard, Remedy } from "@/types/oracle";
import type { MoodLog } from "@/types/mood";

const oracleCards = oracleCardsRaw as OracleCard[];
const remedies = remediesRaw as Remedy[];

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

export function useDailySession(): UseDailySessionReturn {
  const [sessionState, setSessionState] = useState<DailySessionState>({ status: "loading" });
  const [note, setNote] = useState("");

  const moodScore = useMoodScore();
  const setMoodScore = useSetMoodScore();
  const router = useRouter();

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
      const today = getTodayDateString();

      // Pre-calculate oracle data before writing to DB (DB-01: single write, DB-02: targeted query)
      // Non-fatal: if oracle computation fails, mood is still saved without oracle data
      let oracleData:
        | { moonPhase: ReturnType<typeof getMoonPhase>; oracleCardId: string; oracleRemedyId: string }
        | undefined;

      try {
        const moonPhase = getMoonPhase(new Date());
        const recentLogs = await getRecentLogs(today, 30);
        const trend = calculateMoodTrend(recentLogs, moodScore);
        const result = selectOracle({ moodScore, moonPhase, trend }, oracleCards, remedies);
        oracleData = { moonPhase, oracleCardId: result.card.id, oracleRemedyId: result.remedy.id };
      } catch (oracleError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Errore durante la selezione dell'oracolo", oracleError);
        }
        // non-fatal: navigate to oracle page anyway (it will show graceful fallback)
      }

      // Single atomic write — includes oracle data when available
      const savedLog = await saveMoodLog({
        ...buildDailySessionSavePayload({
          sessionState,
          date: today,
          moodScore,
          note,
        }),
        ...oracleData,
      });

      setSessionState({ status: "saved", log: savedLog });
      setNote(savedLog.note ?? "");

      router.push("/oracle");
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
