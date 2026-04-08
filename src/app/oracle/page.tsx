"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { getTodayLog } from "@/services/db";
import { OracleCardDisplay } from "@/components/oracle/OracleCardDisplay";
import { SuggestedRemedy } from "@/components/oracle/SuggestedRemedy";
import oracleCardsRaw from "@/data/oracle_seed.json";
import remediesRaw from "@/data/remedies_seed.json";
import type { OracleCard, Remedy } from "@/types/oracle";
import type { MoonPhaseName } from "@/types/astrology";
import {
  resolveOraclePageState,
  type OraclePageResolvedState,
} from "@/app/oracle/oraclePageState";

const oracleCards = oracleCardsRaw as OracleCard[];
const remedies = remediesRaw as Remedy[];

const MOON_PHASE_IT: Record<MoonPhaseName, string> = {
  "New Moon": "Luna Nuova",
  "Waxing Crescent": "Luna Crescente",
  "First Quarter": "Primo Quarto",
  "Waxing Gibbous": "Luna Gibbosa Crescente",
  "Full Moon": "Luna Piena",
  "Waning Gibbous": "Luna Gibbosa Calante",
  "Last Quarter": "Ultimo Quarto",
  "Waning Crescent": "Luna Calante",
};

type PageState =
  | { status: "loading" }
  | OraclePageResolvedState;

export default function OraclePage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [isRemedyVisible, setIsRemedyVisible] = useState(false);
  const handleFlipComplete = useCallback(() => {
    setIsRemedyVisible(true);
  }, []);

  useEffect(() => {
    void getTodayLog().then((log) => {
      const resolvedState = resolveOraclePageState(log, oracleCards, remedies, MOON_PHASE_IT);
      setIsRemedyVisible(false);
      setPageState(resolvedState);
    }).catch(() => {
      setIsRemedyVisible(false);
      setPageState({ status: "empty" });
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <AnimatePresence mode="wait">
        {pageState.status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="font-display text-2xl font-bold text-white/80 animate-pulse">
              Moonmood
            </span>
            <span className="text-sm text-white/40">Caricamento...</span>
          </motion.div>
        )}

        {pageState.status === "empty" && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 text-center max-w-xs"
          >
            <span className="text-5xl" aria-hidden="true">🌑</span>
            <p className="font-display text-xl font-bold text-white/80">
              Non hai ancora registrato il tuo umore oggi.
            </p>
            <p className="text-sm text-white/50">
              Torna alla home per registrare il tuo stato emotivo e ricevere il tuo oracolo.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-colors"
            >
              Torna alla Home
            </button>
          </motion.div>
        )}

        {pageState.status === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            {/* Moon phase decorative label */}
            {pageState.moonPhaseIt && (
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">🌙</span>
                <span className="text-sm text-white/60 font-medium">
                  {pageState.moonPhaseIt}
                </span>
              </div>
            )}

            {/* Oracle card with 3D flip */}
            <OracleCardDisplay
              card={pageState.card}
              onFlipComplete={handleFlipComplete}
            />

            {/* Remedy — fades in after card flip */}
            <SuggestedRemedy remedy={pageState.remedy} isVisible={isRemedyVisible} />

            {/* Subtle home link */}
            <button
              onClick={() => router.push("/")}
              className="text-xs text-white/30 hover:text-white/60 transition-colors mt-2"
            >
              ← Torna alla Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
