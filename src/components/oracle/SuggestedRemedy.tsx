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
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full mx-auto flex flex-col gap-3"
      style={{
        background: "var(--glass-bg-soft)",
        border: "1px solid var(--glass-border-soft)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "var(--radius-card)",
        padding: "1.25rem",
        maxWidth: "20rem",
      }}
    >
      {/* Category label */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(245,247,255,0.45)" }}
        >
          {label}
        </span>
      </div>

      {/* Remedy text */}
      <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.82)" }}>
        {remedy.text}
      </p>
    </motion.div>
  );
}

export const SuggestedRemedy = memo(SuggestedRemedyBase);
