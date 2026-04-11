"use client";

import { useCallback } from "react";
import Link from "next/link";

import { clearAllLocalData } from "@/services/db";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const sticazziEnabled = useSettings((state) => state.sticazziEnabled);
  const toggleSticazzi = useSettings((state) => state.toggleSticazzi);
  const handleClearData = useCallback(async () => {
    const confirmed = window.confirm(
      "Sei sicuro di voler cancellare tutti i dati locali? Questa azione è irreversibile."
    );
    if (!confirmed) return;

    await clearAllLocalData();
    window.alert("Dati locali eliminati con successo.");
  }, []);

  return (
    <main className="flex flex-col gap-4 px-4 pt-10 pb-4">
      {/* Header */}
      <header className="text-center pb-2">
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Preferenze
        </p>
        <h1
          className="font-display text-2xl font-bold mt-1"
          style={{ color: "var(--text-primary)" }}
        >
          Impostazioni
        </h1>
      </header>

      {/* Privacy link */}
      <Link
        href="/privacy"
        className="glass-interactive rounded-2xl p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Privacy
          </span>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "rgba(245,247,255,0.4)" }}
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>

      {/* Contenuto */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Contenuto
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sticazzi
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={sticazziEnabled}
            onClick={toggleSticazzi}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            style={{
              background: sticazziEnabled ? "var(--accent-violet)" : "rgba(245,247,255,0.15)",
            }}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform"
              style={{
                transform: sticazziEnabled ? "translateX(24px)" : "translateX(2px)",
              }}
            />
          </button>
        </div>
      </section>

      {/* Clear data */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Gestione dati
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.55)" }}>
          Cancella tutti i dati salvati localmente sul tuo dispositivo. Questa azione è
          irreversibile.
        </p>
        <button
          type="button"
          onClick={handleClearData}
          className="btn-ghost"
          style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
        >
          Cancella tutti i dati
        </button>
      </section>
    </main>
  );
}
