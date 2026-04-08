"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { getSaveMessage } from "@/lib/moodConfig";

export interface SaveMoodButtonProps {
  onSave: () => Promise<void>;
  moodScore?: number;
  disabled?: boolean;
  className?: string;
}

interface Sparkle {
  id: number;
  angle: number;
  distance: number;
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 30 - 15,
    distance: 32 + Math.random() * 20,
  }));
}

export function SaveMoodButton({ onSave, moodScore = 5, disabled, className }: SaveMoodButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  async function handleSave() {
    if (saving || disabled) {
      return;
    }

    setSaving(true);

    try {
      await onSave();
      setSaved(true);

      // Sparkle effect per score alti (7+)
      if (moodScore >= 7) {
        const count = 5 + Math.floor(Math.random() * 4); // 5-8
        setSparkles(generateSparkles(count));
        setTimeout(() => setSparkles([]), 700);
      }

      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const saveMessage = getSaveMessage(moodScore);

  return (
    <div className="relative">
      {/* Sparkle particles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => {
          const rad = (sparkle.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * sparkle.distance;
          const ty = Math.sin(rad) * sparkle.distance;
          return (
            <motion.div
              key={sparkle.id}
              className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-white"
              style={{ x: "-50%", y: "-50%" }}
              initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              animate={{
                opacity: 0,
                scale: 0.4,
                x: `calc(-50% + ${tx}px)`,
                y: `calc(-50% + ${ty}px)`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleSave}
        disabled={disabled || saving}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={
          saved
            ? { opacity: 1, y: 0, scale: [1, 1.04, 1] }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          saved
            ? { duration: 0.36, type: "tween", ease: "easeInOut" }
            : { duration: 0.28, type: "spring" }
        }
        className={`relative h-14 w-full rounded-full font-semibold transition ${className ?? ""}`}
        style={{
          background: saved
            ? "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(139,92,246,0.35))"
            : "linear-gradient(135deg, rgba(139,92,246,0.30), rgba(6,182,212,0.20))",
          border: "1px solid rgba(139,92,246,0.40)",
          color: "var(--text-primary)",
          boxShadow: "0 0 28px rgba(139,92,246,0.24)",
          opacity: (disabled || saving) ? 0.5 : 1,
          cursor: (disabled || saving) ? "not-allowed" : "pointer",
        }}
      >
        {saving ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
            Salvando...
          </span>
        ) : saved ? (
          saveMessage
        ) : (
          "Salva il tuo umore"
        )}
      </motion.button>
    </div>
  );
}
