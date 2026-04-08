"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { getMoodLevel, getEncouragingMessage } from "@/lib/moodConfig";
import type { MoodLog } from "@/types/mood";
import { MoodHistory } from "@/components/mood/MoodHistory";
import { useGradientIntensity } from "@/context/GradientIntensityContext";

export interface ReadOnlyViewProps {
  log: MoodLog;
  onEdit: () => void;
}

const easeSmooth: [number, number, number, number] = [0.4, 0, 0.2, 1];

const itemTransition: Transition = {
  duration: 0.35,
  ease: easeSmooth,
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: itemTransition },
};

export function ReadOnlyView({ log, onEdit }: ReadOnlyViewProps) {
  const moodLevel = getMoodLevel(log.moodScore);
  const encouragingMessage = getEncouragingMessage();
  const { setIntensity } = useGradientIntensity();

  useEffect(() => {
    setIntensity(0.6);
    return () => setIntensity(1);
  }, [setIntensity]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-sm flex-col items-center gap-5"
      >
        {/* Emoji grande con breathing animation */}
        <motion.div variants={item} className="flex flex-col items-center gap-2">
          <motion.span
            className="text-7xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            {moodLevel.emoji}
          </motion.span>
          <span className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{moodLevel.label}</span>
          <span className="text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>{encouragingMessage}</span>
        </motion.div>

        {/* Glass card con glow colorato */}
        <motion.div
          variants={item}
          className="w-full space-y-3 rounded-2xl p-6"
          style={{
            background: "var(--glass-bg-mid)",
            border: `1px solid ${moodLevel.color}44`,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: `0 0 32px ${moodLevel.color}28`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>Umore</span>
            <div className="flex items-center gap-2">
              <span className="text-xl">{moodLevel.emoji}</span>
              <span className="text-sm" style={{ color: "rgba(245,247,255,0.55)" }}>{log.moodScore}/10</span>
            </div>
          </div>

          {log.note && (
            <div>
              <span className="mb-1 block text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>Nota</span>
              <p className="text-sm" style={{ color: "rgba(245,247,255,0.8)" }}>{log.note}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>Salvato</span>
            <span className="text-sm" style={{ color: "rgba(245,247,255,0.55)" }}>
              {new Date(log.createdAt).toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </motion.div>

        {/* Bottone modifica */}
        <motion.button
          variants={item}
          type="button"
          onClick={onEdit}
          className="btn-ghost"
        >
          Modifica
        </motion.button>

        <motion.div variants={item}>
          <Link
            href="/history"
            className="btn-ghost"
          >
            Rivedi lo storico
          </Link>
        </motion.div>

        {/* Storia completa */}
        <motion.div variants={item} className="w-full">
          <MoodHistory />
        </motion.div>
      </motion.div>
    </main>
  );
}
