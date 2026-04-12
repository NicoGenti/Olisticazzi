"use client";

import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Caricamento..." }: LoadingScreenProps) {
  return (
    <motion.main
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen flex-col items-center justify-center gap-3"
    >
      <span
        className="font-display text-2xl font-bold animate-pulse"
        style={{ color: "var(--accent-violet)" }}
      >
        Moonmood
      </span>
      <span className="text-sm text-muted">{message}</span>
    </motion.main>
  );
}
