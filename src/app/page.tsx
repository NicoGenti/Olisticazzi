"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LiquidSlider } from "@/components/mood/LiquidSlider";
import { MoodNoteInput } from "@/components/mood/MoodNoteInput";
import { SaveMoodButton } from "@/components/mood/SaveMoodButton";
import { MoodHistory } from "@/components/mood/MoodHistory";
import { ReadOnlyView } from "@/components/mood/ReadOnlyView";
import { useDailySession } from "@/hooks/useDailySession";
import { useMoodScore, useSetMoodScore } from "@/hooks/useMoodStore";
import { getGreeting, getMoodQuestion, getMoodLevel } from "@/lib/moodConfig";

export default function Home() {
  const moodScore = useMoodScore();
  const setMoodScore = useSetMoodScore();
  const { sessionState, note, setNote, saveLog, enterEditMode } = useDailySession();

  const greeting = getGreeting();
  const moodQuestion = getMoodQuestion();
  const moodLevel = getMoodLevel(moodScore);

  return (
    <AnimatePresence mode="wait">
      {sessionState.status === "loading" && (
        <motion.main
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="flex min-h-screen flex-col items-center justify-center gap-3"
        >
          <span className="font-display text-2xl font-bold text-white/80 animate-pulse">
            Moonmood
          </span>
          <span className="text-sm text-white/40">Caricamento...</span>
        </motion.main>
      )}

      {sessionState.status === "saved" && (
        <motion.div
          key="saved"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
        >
          <ReadOnlyView log={sessionState.log} onEdit={enterEditMode} />
        </motion.div>
      )}

      {(sessionState.status === "fresh" || sessionState.status === "editing") && (
        <motion.main
          key="form"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12"
        >
          {/* Greeting time-aware */}
          <div className="text-center">
            <p className="text-sm text-white/50 mb-1">{greeting}</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              {moodQuestion}
            </h1>
          </div>

          {/* Display emotivo */}
          <div className="text-center">
            <motion.div
              className="text-7xl mb-2"
              key={moodLevel.emoji}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {moodLevel.emoji}
            </motion.div>
            <div className="text-lg font-semibold text-white">{moodLevel.label}</div>
            <div className="text-sm text-white/50 mt-0.5">{Math.round(moodScore * 10) / 10}/10</div>
          </div>

          <div className="w-full max-w-sm">
            <LiquidSlider value={moodScore} onValueChange={setMoodScore} />
          </div>

          <div className="w-full max-w-sm">
            <MoodNoteInput value={note} onChange={setNote} />
          </div>

          <div className="w-full max-w-sm">
            <SaveMoodButton onSave={saveLog} moodScore={moodScore} />
          </div>

          {/* Storia ultimi 7 giorni */}
          <div className="w-full max-w-sm">
            <MoodHistory />
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
