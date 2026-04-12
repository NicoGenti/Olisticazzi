"use client";

import { useEffect, useRef } from "react";
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
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Fix 2: Auto-focus cancel button when dialog opens
  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  // Fix 3: Escape key closes dialog
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

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
          {/* Fix 1: ARIA dialog semantics */}
          <motion.div
            key="confirm-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated rounded-2xl p-6"
            style={{ maxWidth: "24rem", width: "100%" }}
          >
            <h2
              id="confirm-dialog-title"
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
                ref={cancelRef}
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
