"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LiquidSlider } from "@/components/mood/LiquidSlider";
import { MoodNoteInput } from "@/components/mood/MoodNoteInput";
import { SaveMoodButton } from "@/components/mood/SaveMoodButton";
import { useDailySession } from "@/hooks/useDailySession";
import { useMoodScore, useSetMoodScore } from "@/hooks/useMoodStore";
import { getMoodQuestion, getGreeting, getMoodLevel } from "@/lib/moodConfig";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function MoodPage() {
  const moodScore = useMoodScore();
  const setMoodScore = useSetMoodScore();
  const { sessionState, note, setNote, saveLog, enterEditMode } = useDailySession();

  const greeting = getGreeting();
  const moodQuestion = getMoodQuestion();
  const moodLevel = getMoodLevel(moodScore);

  return (
    <AnimatePresence mode="wait">
      {/* Loading state */}
      {sessionState.status === "loading" && <LoadingScreen />}

      {/* Saved state — show summary and allow editing */}
      {sessionState.status === "saved" && (
        <motion.main
          key="saved"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
          className="flex flex-col gap-4 px-4 pt-10 pb-4"
        >
          {/* Header */}
          <motion.header variants={fadeUp} className="text-center pb-2">
            <p className="text-xs uppercase tracking-wider text-muted">
              {greeting}
            </p>
            <h1 className="font-display text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
              Il tuo umore
            </h1>
          </motion.header>

          {/* Saved mood summary card */}
          <motion.div variants={fadeUp}>
            <div
              className="glass-elevated rounded-2xl p-5 space-y-4"
              style={{ boxShadow: `0 0 32px ${getMoodLevel(sessionState.log.moodScore).color}28` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Umore del giorno</p>
                  <p className="text-lg font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
                    {getMoodLevel(sessionState.log.moodScore).label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{getMoodLevel(sessionState.log.moodScore).emoji}</span>
                  <span
                    className="text-base font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: `${getMoodLevel(sessionState.log.moodScore).color}22`,
                      color: getMoodLevel(sessionState.log.moodScore).color,
                      border: `1px solid ${getMoodLevel(sessionState.log.moodScore).color}44`,
                    }}
                  >
                    {sessionState.log.moodScore}/10
                  </span>
                </div>
              </div>

              {sessionState.log.note && (
                <p className="text-sm leading-relaxed text-body">
                  &ldquo;{sessionState.log.note}&rdquo;
                </p>
              )}

              <p className="text-xs text-dim">
                Salvato alle{" "}
                {new Date(sessionState.log.createdAt).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </motion.div>

          {/* Edit CTA */}
          <motion.div variants={fadeUp}>
            <button
              type="button"
              onClick={enterEditMode}
              className="btn-ghost w-full"
              style={{ height: 48 }}
            >
              Modifica il tuo umore
            </button>
          </motion.div>
        </motion.main>
      )}

      {/* Fresh / Editing — full mood entry form */}
      {(sessionState.status === "fresh" || sessionState.status === "editing") && (
        <motion.main
          key="form"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
          className="flex flex-col gap-5 px-4 pt-10 pb-4"
        >
          {/* Contextual header */}
          <motion.header variants={fadeUp} className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted">
              {greeting}
            </p>
            <h1 className="font-display text-2xl font-bold mt-1 leading-snug" style={{ color: "var(--text-primary)" }}>
              {moodQuestion}
            </h1>
          </motion.header>

          {/* Current mood label above slider */}
          <motion.div variants={fadeUp} className="text-center -mb-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={moodLevel.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
                aria-live="polite"
                aria-atomic="true"
              >
                {moodLevel.emoji} {moodLevel.label}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Slider in glass card */}
          <motion.div variants={fadeUp}>
            <div className="glass rounded-2xl px-4 py-5">
              <LiquidSlider value={moodScore} onValueChange={setMoodScore} />
            </div>
          </motion.div>

          {/* Note input */}
          <motion.div variants={fadeUp}>
            <MoodNoteInput value={note} onChange={setNote} />
          </motion.div>

          {/* Save button */}
          <motion.div variants={fadeUp}>
            <SaveMoodButton onSave={saveLog} moodScore={moodScore} />
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
