"use client";

import { useCallback } from "react";
import Link from "next/link";

import { clearAllLocalData } from "@/services/db";
import { useSettings } from "@/hooks/useSettings";

const LANGUAGES = [
  { code: "it", label: "Italiano", available: true },
  { code: "en", label: "English", available: false },
  { code: "es", label: "Español", available: false },
] as const;

function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
      style={{
        background: checked ? "var(--accent-violet)" : "rgba(245,247,255,0.15)",
      }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform"
        style={{
          transform: checked ? "translateX(24px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const sticazziEnabled = useSettings((state) => state.sticazziEnabled);
  const ecoEnabled = useSettings((state) => state.ecoEnabled);
  const notificationsEnabled = useSettings((state) => state.notificationsEnabled);
  const toggleSticazzi = useSettings((state) => state.toggleSticazzi);
  const toggleEco = useSettings((state) => state.toggleEco);
  const toggleNotifications = useSettings((state) => state.toggleNotifications);

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

      {/* Lingua */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          🌐 Lingua
        </h2>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{
                background: lang.available
                  ? "rgba(139,92,246,0.12)"
                  : "rgba(245,247,255,0.04)",
                border: lang.available
                  ? "1px solid rgba(139,92,246,0.24)"
                  : "1px solid rgba(245,247,255,0.06)",
                opacity: lang.available ? 1 : 0.5,
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{
                  color: lang.available
                    ? "var(--text-primary)"
                    : "rgba(245,247,255,0.4)",
                }}
              >
                {lang.label}
              </span>
              {lang.available ? (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(139,92,246,0.2)",
                    color: "var(--accent-violet)",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  Attiva
                </span>
              ) : (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(245,247,255,0.06)",
                    color: "rgba(245,247,255,0.35)",
                    border: "1px solid rgba(245,247,255,0.08)",
                  }}
                >
                  Prossimamente
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Notifiche */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          🔔 Notifiche
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifiche giornaliere
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(245,247,255,0.45)" }}
            >
              Le notifiche push saranno disponibili in futuro
            </p>
          </div>
          <ToggleSwitch
            checked={notificationsEnabled}
            onChange={toggleNotifications}
            ariaLabel="Notifiche giornaliere"
          />
        </div>
      </section>

      {/* Contenuto */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          ✨ Contenuto
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Eco del Giorno
          </span>
          <ToggleSwitch
            checked={ecoEnabled}
            onChange={toggleEco}
            ariaLabel="Eco del Giorno"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sticazzi
          </span>
          <ToggleSwitch
            checked={sticazziEnabled}
            onChange={toggleSticazzi}
            ariaLabel="Sticazzi"
          />
        </div>
      </section>

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

      {/* Clear data */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          🗑️ Gestione dati
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
