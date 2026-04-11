"use client";

import { useEffect, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ServiceWorkerRegistrar() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/Moonmood/sw.js")
      .then((registration) => {
        // Check for updates on page load
        registration.update();

        // Detect a new SW entering the "waiting" state
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version installed but waiting to activate
              setWaitingWorker(newWorker);
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {
        // Registration failed — silent, non-critical
      });

    // When the new SW activates and claims this client, reload the page
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }, [waitingWorker]);

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="fixed left-0 right-0 z-50 flex justify-center px-4"
          style={{
            bottom:
              "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 12px)",
          }}
        >
          <div
            className="glass-elevated flex w-full max-w-lg items-center gap-3 rounded-2xl p-4"
            style={{
              boxShadow: "0 0 32px rgba(6, 182, 212, 0.18)",
            }}
          >
            {/* Sparkle icon */}
            <span className="flex-shrink-0 text-2xl" aria-hidden>
              ✨
            </span>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Aggiornamento disponibile
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Una nuova versione di Moonmood è pronta
              </p>
            </div>

            {/* Update button */}
            <button
              type="button"
              onClick={applyUpdate}
              className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(6, 182, 212, 0.28), rgba(139, 92, 246, 0.18))",
                border: "1px solid rgba(6, 182, 212, 0.4)",
                color: "var(--text-primary)",
                boxShadow: "0 0 16px rgba(6, 182, 212, 0.2)",
              }}
            >
              Aggiorna
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
