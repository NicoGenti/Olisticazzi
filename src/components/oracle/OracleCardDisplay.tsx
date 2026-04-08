"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import type { OracleCard } from "@/types/oracle";

interface OracleCardDisplayProps {
  card: OracleCard;
  onFlipComplete?: () => void;
}

/**
 * 3D tarot-flip card component.
 * Animates from face-down (rotateY 180) to face-up (rotateY 0) over 1.2s.
 * Uses Framer Motion for the Y-axis rotation, preserve-3d + backfaceVisibility for the flip effect.
 */
function OracleCardDisplayBase({ card, onFlipComplete }: OracleCardDisplayProps) {
  return (
    <div style={{ perspective: "1200px" }} className="flex items-center justify-center">
      <motion.div
        className="relative w-64 h-96"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1.0],
        }}
        onAnimationComplete={onFlipComplete}
      >
        {/* Back face — visible at start of flip */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 rounded-2xl border border-white/20 flex flex-col items-center justify-center gap-4 p-6">
            {/* Decorative moon pattern */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-40"
            >
              <circle cx="32" cy="32" r="20" stroke="white" strokeWidth="1.5" />
              <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
              <path
                d="M32 12 C32 12 20 24 20 32 C20 40 32 52 32 52"
                stroke="white"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <circle
                  key={angle}
                  cx={32 + 28 * Math.cos((angle * Math.PI) / 180)}
                  cy={32 + 28 * Math.sin((angle * Math.PI) / 180)}
                  r="1.5"
                  fill="white"
                  opacity="0.5"
                />
              ))}
            </svg>
            <span className="font-display text-lg font-bold text-white/30 tracking-widest uppercase">
              Moonmood
            </span>
          </div>
        </div>

        {/* Front face — revealed after flip */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background: "var(--glass-bg-mid)",
            border: "1px solid var(--glass-border-mid)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(6,182,212,0.08) 100%)",
            }}
          />
          <div className="w-full h-full flex flex-col p-6 gap-3 relative">
            {/* Card name */}
            <h2 className="font-display text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {card.name}
            </h2>

            {/* Divider */}
            <div className="w-8 h-px" style={{ background: "var(--glass-border-mid)" }} />

            {/* Description */}
            <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(245,247,255,0.78)" }}>
              {card.description}
            </p>

            {/* Tags as pills */}
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    color: "rgba(245,247,255,0.55)",
                    border: "1px solid var(--glass-border-soft)",
                    background: "var(--glass-bg-soft)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export const OracleCardDisplay = memo(OracleCardDisplayBase);
