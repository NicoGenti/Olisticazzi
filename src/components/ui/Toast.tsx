"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, visible, onHide, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible, onHide, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 8, x: "-50%" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="glass-elevated"
          style={{
            position: "fixed",
            bottom: "calc(var(--nav-height) + 16px)",
            left: "50%",
            zIndex: 9998,
            borderRadius: "9999px",
            padding: "0.75rem 1.25rem",
            fontSize: "0.875rem",
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
