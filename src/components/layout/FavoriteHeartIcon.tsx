"use client";

import { motion } from "framer-motion";

interface FavoriteHeartIconProps {
  favorited: boolean;
  animating: boolean;
  onToggle: (e: React.MouseEvent) => void;
  ariaLabel?: string;
}

export function FavoriteHeartIcon({
  favorited,
  animating,
  onToggle,
  ariaLabel,
}: FavoriteHeartIconProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      animate={animating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      aria-label={ariaLabel ?? (favorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti")}
      style={{
        background: "none",
        border: "none",
        padding: "10px",
        cursor: "pointer",
        color: favorited ? "var(--accent-pink)" : "rgba(245,247,255,0.40)",
        fontSize: "1.25rem",
        lineHeight: 1,
      }}
    >
      {favorited ? "♥" : "♡"}
    </motion.button>
  );
}
