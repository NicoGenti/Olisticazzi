"use client";

import { LiquidSlider } from "@/components/mood/LiquidSlider";
import { MoodNoteInput } from "@/components/mood/MoodNoteInput";
import { SaveMoodButton } from "@/components/mood/SaveMoodButton";
import { useDailySession } from "@/hooks/useDailySession";
import { useMoodScore, useSetMoodScore } from "@/hooks/useMoodStore";
import type { MoodLog } from "@/types/mood";

export default function Home() {
  const moodScore = useMoodScore();
  const setMoodScore = useSetMoodScore();
  const { sessionState, note, setNote, saveLog, enterEditMode } = useDailySession();

  if (sessionState.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
      </main>
    );
  }

  if (sessionState.status === "saved") {
    return <ReadOnlyView log={sessionState.log} onEdit={enterEditMode} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <h1 className="sr-only">Olisticazzi — Registra il tuo umore</h1>

      <div className="w-full max-w-sm">
        <LiquidSlider value={moodScore} onValueChange={setMoodScore} />
      </div>

      <div className="w-full max-w-sm">
        <MoodNoteInput value={note} onChange={setNote} />
      </div>

      <div className="w-full max-w-sm">
        <SaveMoodButton onSave={saveLog} />
      </div>
    </main>
  );
}

function ReadOnlyView({ log, onEdit }: { log: MoodLog; onEdit: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <p className="max-w-xs text-lg leading-relaxed text-white/70">
        Hai già registrato il tuo umore oggi.
        <br />
        <span className="text-base text-white/50">Come stai adesso?</span>
      </p>

      <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white/10 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Umore</span>
          <span className="text-xl font-semibold text-white">{log.moodScore}/10</span>
        </div>

        {log.note && (
          <div>
            <span className="mb-1 block text-sm text-white/50">Nota</span>
            <p className="text-sm text-white/80">{log.note}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Salvato</span>
          <span className="text-sm text-white/60">
            {new Date(log.createdAt).toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="rounded-full bg-white/10 px-6 py-3 text-sm text-white/70 transition-colors hover:bg-white/20 hover:text-white"
      >
        Modifica
      </button>
    </main>
  );
}
