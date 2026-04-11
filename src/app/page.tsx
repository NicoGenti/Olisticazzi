"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useDailySession } from "@/hooks/useDailySession";
import { getMoodLevel, getGreeting } from "@/lib/moodConfig";
import { MoodHistory } from "@/components/mood/MoodHistory";
import { EcoDelGiorno } from "@/components/home/EcoDelGiorno";
import { SticazziCard } from "@/components/home/SticazziCard";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const } },
};

export default function Home() {
  const { sessionState } = useDailySession();
  const greeting = getGreeting();

  return (
    <AnimatePresence mode="wait">
      {/* Loading state */}
      {sessionState.status === "loading" && (
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

      {/* Dashboard */}
      {(sessionState.status === "fresh" || sessionState.status === "saved" || sessionState.status === "editing") && (
        <motion.main
          key="dashboard"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
          className="flex flex-col gap-4 px-4 pt-10 pb-4"
        >
          {/* Hero branding */}
          <motion.header variants={fadeUp} className="text-center pt-2 pb-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "rgba(245,247,255,0.4)" }}>
              {greeting}
            </p>
            <h1
              className="font-display text-3xl font-bold mt-1"
              style={{
                background: "linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Moonmood
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(245,247,255,0.5)" }}>
              Il tuo tracker spirituale dell&apos;umore
            </p>
          </motion.header>

          {/* Daily status card */}
          <motion.div variants={fadeUp}>
            {sessionState.status === "saved" || sessionState.status === "editing" ? (
              // Saved mood card
              <DailyMoodCard
                moodScore={sessionState.log.moodScore}
                date={sessionState.log.date}
                note={sessionState.log.note}
              />
            ) : (
              // Not yet logged today
              <Link href="/mood" className="block">
                <div
                  className="glass-interactive rounded-2xl p-5 flex items-center justify-between"
                  style={{ minHeight: 72 }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Come stai oggi?
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(245,247,255,0.5)" }}>
                      Non hai ancora registrato il tuo umore
                    </p>
                  </div>
                  <span
                    className="text-2xl rounded-full flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))",
                      border: "1px solid rgba(139,92,246,0.35)",
                    }}
                  >
                    ✨
                  </span>
                </div>
              </Link>
            )}
           </motion.div>

          {/* Eco del Giorno */}
          <motion.div variants={fadeUp}>
            <EcoDelGiorno />
          </motion.div>

          {/* Sticazzi */}
          <motion.div variants={fadeUp}>
            <SticazziCard />
          </motion.div>

          {/* Oracle CTA */}
          <motion.div variants={fadeUp}>
            <Link href="/oracle">
              <div
                className="glass rounded-2xl p-5 flex items-center gap-4"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(6,182,212,0.12) 100%)",
                  border: "1px solid rgba(139,92,246,0.28)",
                }}
              >
                <span className="text-3xl">🌙</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Oracolo del giorno
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(245,247,255,0.5)" }}>
                    {sessionState.status === "saved"
                      ? "La tua carta ti aspetta"
                      : "Registra l'umore per accedere"}
                  </p>
                </div>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "rgba(245,247,255,0.4)", flexShrink: 0 }}
                  aria-hidden
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          </motion.div>

          {/* Il tuo flusso emotivo */}
          <motion.div variants={fadeUp}>
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Il tuo flusso emotivo
                </p>
                <Link
                  href="/history"
                  className="text-xs"
                  style={{ color: "var(--accent-violet)" }}
                >
                  Vedi tutto
                </Link>
              </div>
              <MoodHistory />
            </div>
          </motion.div>

          {/* Quick actions row */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <Link
              href="/report"
              className="glass-interactive rounded-2xl p-4 flex flex-col gap-2"
            >
              <span className="text-xl">📊</span>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Report</p>
              <p className="text-xs" style={{ color: "rgba(245,247,255,0.5)" }}>I tuoi trend</p>
            </Link>
            <Link
              href="/oracle"
              className="glass-interactive rounded-2xl p-4 flex flex-col gap-2"
            >
              <span className="text-xl">🔮</span>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Oracolo</p>
              <p className="text-xs" style={{ color: "rgba(245,247,255,0.5)" }}>Messaggio del giorno</p>
            </Link>
          </motion.div>

          {/* Footer disclaimer */}
          <motion.footer variants={fadeUp} className="text-center pt-2 pb-2">
            <p className="text-xs" style={{ color: "rgba(245,247,255,0.28)" }}>
              Moonmood · Per uso personale e riflessivo
            </p>
          </motion.footer>
        </motion.main>
      )}
    </AnimatePresence>
  );
}

interface DailyMoodCardProps {
  moodScore: number;
  date: string;
  note?: string | null;
}

function DailyMoodCard({ moodScore, date, note }: DailyMoodCardProps) {
  const moodLevel = getMoodLevel(moodScore);

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="glass-elevated rounded-2xl p-5 space-y-3"
      style={{ boxShadow: `0 0 28px ${moodLevel.color}28` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs capitalize" style={{ color: "rgba(245,247,255,0.45)" }}>
            {formattedDate}
          </p>
          <p className="text-lg font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
            {moodLevel.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{moodLevel.emoji}</span>
          <span
            className="text-sm font-bold px-2 py-1 rounded-full"
            style={{
              background: `${moodLevel.color}22`,
              color: moodLevel.color,
              border: `1px solid ${moodLevel.color}44`,
            }}
          >
            {moodScore}/10
          </span>
        </div>
      </div>

      {note && (
        <p
          className="text-sm leading-relaxed line-clamp-2"
          style={{ color: "rgba(245,247,255,0.65)" }}
        >
          {note}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Link
          href="/mood"
          className="btn-ghost text-xs px-3 py-1.5"
          style={{ height: "auto", minHeight: 32 }}
        >
          Modifica
        </Link>
        <Link
          href="/oracle"
          className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.28), rgba(6,182,212,0.18))",
            border: "1px solid rgba(139,92,246,0.35)",
            color: "var(--text-primary)",
            minHeight: 32,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Vedi oracolo →
        </Link>
      </div>
    </div>
  );
}
