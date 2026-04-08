"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import type { Remedy } from "@/types/oracle";

interface SuggestedRemedyProps {
  remedy: Remedy;
  isVisible: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  meditazione: "🧘",
  natura: "🌿",
  scrittura: "✍️",
  movimento: "🚶",
  respiro: "🌬️",
};

const CATEGORY_LABELS: Record<string, string> = {
  meditazione: "Meditazione",
  natura: "Natura",
  scrittura: "Scrittura",
  movimento: "Movimento",
  respiro: "Respiro",
};

/**
 * Remedy suggestion card that fades in after the oracle card flip completes.
 * Uses Framer Motion for the opacity + y-axis fade-in transition.
 */
function SuggestedRemedyBase({ remedy, isVisible }: SuggestedRemedyProps) {
  const icon = CATEGORY_ICONS[remedy.category] ?? "✨";
  const label = CATEGORY_LABELS[remedy.category] ?? remedy.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 16 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-xs mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex flex-col gap-3"
    >
      {/* Category label */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          {label}
        </span>
      </div>

      {/* Remedy text */}
      <p className="text-sm text-white/85 leading-relaxed">{remedy.text}</p>
    </motion.div>
  );
}

export const SuggestedRemedy = memo(SuggestedRemedyBase);
