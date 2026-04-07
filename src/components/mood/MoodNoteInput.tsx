"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export interface MoodNoteInputProps {
  value: string;
  onChange: (note: string) => void;
  className?: string;
}

const NOTE_MAX_LENGTH = 280;
const COUNTER_VISIBLE_THRESHOLD = 240;
const COUNTER_WARNING_THRESHOLD = 270;

export function MoodNoteInput({ value, onChange, className }: MoodNoteInputProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="h-12 w-full rounded-full border border-white/15 bg-white/10 px-4 text-left text-sm text-white/60 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Aggiungi una nota"
        >
          Aggiungi una nota...
        </button>
      )}

      <motion.div
        initial={false}
        animate={{ height: expanded ? 120 : 0, opacity: expanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, NOTE_MAX_LENGTH))}
          placeholder="Come ti senti adesso? Racconta il tuo momento..."
          maxLength={NOTE_MAX_LENGTH}
          className="mt-1 min-h-[120px] w-full resize-none rounded-2xl border border-white/20 bg-[#0c1020]/50 p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/35"
          autoFocus
        />

        {value.length >= COUNTER_VISIBLE_THRESHOLD && (
          <p
            className={`mt-1 pr-1 text-right text-xs ${
              value.length >= COUNTER_WARNING_THRESHOLD ? "text-red-400" : "text-white/50"
            }`}
          >
            {value.length}/{NOTE_MAX_LENGTH}
          </p>
        )}
      </motion.div>
    </div>
  );
}
