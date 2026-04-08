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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const } },
};

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
    <AnimatePresence mode="wait">
      {/* Loading */}
      {pageState.status === "loading" && (
        <motion.main
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-screen flex-col items-center justify-center gap-3"
        >
          <span className="font-display text-2xl font-bold animate-pulse" style={{ color: "var(--accent-violet)" }}>
            Moonmood
          </span>
          <span className="text-sm" style={{ color: "rgba(245,247,255,0.4)" }}>Caricamento...</span>
        </motion.main>
      )}

      {/* Empty — no mood logged */}
      {pageState.status === "empty" && (
        <motion.main
          key="empty"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.36 }}
          className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
        >
          <span className="text-5xl" aria-hidden="true">🌑</span>
          <div className="glass rounded-2xl p-6 max-w-xs w-full space-y-3">
            <p className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Nessun oracolo disponibile
            </p>
            <p className="text-sm" style={{ color: "rgba(245,247,255,0.55)" }}>
              Registra il tuo umore per ricevere il messaggio del giorno.
            </p>
          </div>
          <button
            onClick={() => router.push("/mood")}
            className="btn-primary max-w-xs"
            style={{ maxWidth: 240 }}
          >
            Registra l&apos;umore
          </button>
        </motion.main>
      )}

      {/* Oracle ready */}
      {pageState.status === "ready" && (
        <motion.main
          key="ready"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
          className="flex flex-col gap-5 px-4 pt-8 pb-4"
        >
          {/* Header */}
          <motion.header variants={fadeUp} className="text-center">
            <p
              className="text-xs uppercase tracking-[0.18em]"
              style={{ color: "rgba(245,247,255,0.4)" }}
            >
              Oracolo del Giorno
            </p>
            <h1
              className="font-display text-2xl font-bold mt-1"
              style={{ color: "var(--text-primary)" }}
            >
              Il tuo messaggio
            </h1>
            {pageState.moonPhaseIt && (
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs"
                style={{
                  background: "var(--glass-bg-soft)",
                  border: "1px solid var(--glass-border-soft)",
                  color: "rgba(245,247,255,0.6)",
                }}
              >
                <span aria-hidden="true">🌙</span>
                {pageState.moonPhaseIt}
              </div>
            )}
          </motion.header>

          {/* Oracle card flip */}
          <motion.div variants={fadeUp}>
            <OracleCardDisplay
              card={pageState.card}
              onFlipComplete={handleFlipComplete}
            />
          </motion.div>

          {/* Remedy card */}
          <motion.div variants={fadeUp}>
            <SuggestedRemedy remedy={pageState.remedy} isVisible={isRemedyVisible} />
          </motion.div>

          {/* Approfondimenti accordion */}
          <motion.div variants={fadeUp}>
            <ApprofondimentiAccordion card={pageState.card} />
          </motion.div>

          {/* Back link */}
          <motion.div variants={fadeUp} className="text-center pb-2">
            <button
              onClick={() => router.push("/")}
              className="text-xs"
              style={{ color: "rgba(245,247,255,0.35)" }}
            >
              ← Torna alla Home
            </button>
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}

/* ─── Approfondimenti Accordion ─── */

interface ApprofondimentiAccordionProps {
  card: OracleCard;
}

function ApprofondimentiAccordion({ card }: ApprofondimentiAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      label: "Significato della carta",
      content: card.description,
    },
    {
      label: "Parole chiave",
      content: card.tags.join(" · "),
    },
  ].filter((item) => item.content);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={isOpen}
        style={{ minHeight: 52 }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: "rgba(245,247,255,0.75)" }}
        >
          Approfondimenti (opzionale)
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ color: "rgba(245,247,255,0.4)", display: "inline-flex" }}
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 pt-1 space-y-4"
              style={{ borderTop: "1px solid var(--glass-border-soft)" }}
            >
              {items.map((item) => (
                <div key={item.label} className="space-y-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(245,247,255,0.4)" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(245,247,255,0.75)" }}
                  >
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
