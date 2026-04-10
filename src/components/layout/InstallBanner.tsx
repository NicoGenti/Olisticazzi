"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallBanner() {
  const { canInstall, triggerInstall } = useInstallPrompt();

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="fixed left-0 right-0 z-40 flex justify-center px-4"
          style={{
            bottom:
              "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 12px)",
          }}
        >
          <div
            className="glass-elevated flex w-full max-w-lg items-center gap-3 rounded-2xl p-4"
            style={{
              boxShadow: "0 0 32px rgba(139, 92, 246, 0.18)",
            }}
          >
            {/* Moon icon */}
            <span className="flex-shrink-0 text-2xl" aria-hidden>
              🌙
            </span>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Installa Moonmood
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Accedi rapidamente dalla home del tuo dispositivo
              </p>
            </div>

            {/* Install button */}
            <button
              type="button"
              onClick={triggerInstall}
              className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(6, 182, 212, 0.18))",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                color: "var(--text-primary)",
                boxShadow: "0 0 16px rgba(139, 92, 246, 0.2)",
              }}
            >
              Installa
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
