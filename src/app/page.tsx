"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useDailySession } from "@/hooks/useDailySession";
import { useEcoEnabled } from "@/hooks/useSettings";
import { getMoodLevel, getGreeting } from "@/lib/moodConfig";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { MoodHistory } from "@/components/mood/MoodHistory";
import { EcoDelGiorno } from "@/components/home/EcoDelGiorno";
import { SticazziCard } from "@/components/home/SticazziCard";

export default function Home() {
  const { sessionState } = useDailySession();
  const greeting = getGreeting();
  const ecoEnabled = useEcoEnabled();

  return (
    <AnimatePresence mode="wait">
      {/* Loading state */}
      {sessionState.status === "loading" && <LoadingScreen />}

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
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
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
            <p className="text-sm mt-1 text-subtle">
              Il tuo tracker spirituale dell&apos;umore
            </p>
          </motion.header>

          {/* Daily status card */}
          <motion.div variants={fadeUp} aria-live="polite" aria-atomic="true">
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
                    <p className="text-xs mt-0.5 text-subtle">
                      Non hai ancora registrato il tuo umore
                    </p>
                  </div>
                  <span
                    className="text-2xl rounded-full flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      background: "var(--btn-gradient)",
                      border: "1px solid var(--btn-border)",
                    }}
                  >
                    ✨
                  </span>
                </div>
              </Link>
            )}
           </motion.div>

          {/* Eco del Giorno */}
          {ecoEnabled && (
            <motion.div variants={fadeUp}>
              <EcoDelGiorno />
            </motion.div>
          )}

          {/* Sticazzi */}
          <motion.div variants={fadeUp}>
            <SticazziCard />
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
              <MoodHistory limit={3} />
            </div>
          </motion.div>

          {/* Footer disclaimer */}
          <motion.footer variants={fadeUp} className="text-center pt-2 pb-2">
            <p className="text-xs text-dim">
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
          <p className="text-xs capitalize text-muted">
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
          className="text-sm leading-relaxed line-clamp-2 text-body"
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
          className="btn-gradient text-xs px-3 py-1.5"
          style={{ minHeight: 32 }}
        >
          Vedi oracolo →
        </Link>
      </div>
    </div>
  );
}
