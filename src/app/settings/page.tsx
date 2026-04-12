"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

import { clearAllLocalData } from "@/services/db";
import { useSettings } from "@/hooks/useSettings";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";

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

  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleConfirmClear = useCallback(async () => {
    try {
      await clearAllLocalData();
      setShowConfirm(false);
      setShowToast(true);
    } catch (err) {
      console.error("Failed to clear data:", err);
      setShowConfirm(false);
    }
  }, []);

  return (
    <main className="flex flex-col gap-4 px-4 pt-10 pb-4">
      {/* Header */}
      <header className="text-center pb-2">
        <p
          className="text-xs uppercase tracking-[0.18em] text-muted"
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
          className="text-sm font-semibold uppercase tracking-wider text-muted"
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
                  ? "var(--violet-bg)"
                  : "var(--disabled-bg)",
                border: lang.available
                  ? "1px solid var(--violet-border)"
                  : "1px solid var(--disabled-border)",
                opacity: lang.available ? 1 : 0.5,
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{
                  color: lang.available
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                }}
              >
                {lang.label}
              </span>
              {lang.available ? (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--violet-bg-strong)",
                    color: "var(--accent-violet)",
                    border: "1px solid var(--violet-border)",
                  }}
                >
                  Attiva
                </span>
              ) : (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--disabled-bg)",
                    color: "var(--disabled-text)",
                    border: "1px solid var(--disabled-border)",
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
          className="text-sm font-semibold uppercase tracking-wider text-muted"
        >
          🔔 Notifiche
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifiche giornaliere
            </p>
            <p
              className="text-xs mt-0.5 text-muted"
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
          className="text-sm font-semibold uppercase tracking-wider text-muted"
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

      {/* Preferiti link */}
      <Link
        href="/favorites"
        className="link-row"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">💜</span>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Preferiti
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
          className="chevron-icon"
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>

      {/* Privacy link */}
      <Link
        href="/privacy"
        className="link-row"
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
          className="chevron-icon"
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>

      {/* Clear data */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider text-muted"
        >
          🗑️ Gestione dati
        </h2>
        <p className="text-sm leading-relaxed text-soft">
          Cancella tutti i dati salvati localmente sul tuo dispositivo. Questa azione è
          irreversibile.
        </p>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="btn-ghost"
          style={{ color: "var(--red-text)", borderColor: "var(--red-border)" }}
        >
          Cancella tutti i dati
        </button>
      </section>

      <ConfirmDialog
        open={showConfirm}
        title="Cancella tutti i dati"
        message="Sei sicuro di voler cancellare tutti i dati locali? Questa azione è irreversibile."
        danger={true}
        confirmLabel="Cancella"
        cancelLabel="Annulla"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmClear}
      />

      <Toast
        message="Dati locali eliminati con successo."
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
    </main>
  );
}
