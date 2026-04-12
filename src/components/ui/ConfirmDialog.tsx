"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.6)",
            padding: "1rem",
          }}
        >
          {/* Card — stop propagation so backdrop click doesn't fire from card */}
          <motion.div
            key="confirm-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated rounded-2xl p-6"
            style={{ maxWidth: "24rem", width: "100%" }}
          >
            <h2
              className="font-display text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
            <p className="text-sm text-subtle mt-2">{message}</p>

            <div
              className="mt-6 flex gap-3 justify-end"
            >
              <button
                type="button"
                onClick={onCancel}
                className="btn-ghost"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={danger ? "btn-ghost" : "btn-gradient"}
                style={
                  danger
                    ? {
                        color: "var(--red-text)",
                        borderColor: "var(--red-border)",
                      }
                    : undefined
                }
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
