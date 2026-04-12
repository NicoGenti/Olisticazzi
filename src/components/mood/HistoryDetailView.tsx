"use client";

import type { HistoryDetailResolvedState } from "@/app/history/historyDetailState";

interface HistoryDetailViewProps {
  state: Exclude<HistoryDetailResolvedState, { status: "not-found" }>;
  onBack: () => void;
}

export function HistoryDetailView({ state, onBack }: HistoryDetailViewProps) {
  // Format date in Italian: "martedì 8 aprile 2026"
  const formatDateInItalian = (dateStr: string): string => {
    const date = new Date(`${dateStr}T00:00:00`);
    const formatted = date.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-4 px-4 pt-8 pb-4">
      <button
        type="button"
        onClick={onBack}
        className="btn-ghost self-start"
        style={{ height: 40 }}
      >
        ← Torna alla lista
      </button>

      {/* Memory header card */}
      <section
        className="glass-elevated rounded-2xl p-5 space-y-2"
      >
        <p
          className="text-xs uppercase tracking-wider text-muted"
        >
          Memoria
        </p>
        <h1
          className="font-display text-2xl font-bold capitalize"
          style={{ color: "var(--text-primary)" }}
        >
          {formatDateInItalian(state.date)}
        </h1>
        <p className="text-sm text-body">
          Umore: <strong>{state.moodScore}/10</strong>
        </p>
        {state.moonPhaseIt && (
          <div
            className="moon-pill"
          >
            🌙 {state.moonPhaseIt}
          </div>
        )}
      </section>

      {state.status === "partial" && (
        <section
          className="glass rounded-xl p-4"
          style={{ borderColor: "var(--warning-border)", background: "var(--warning-bg)" }}
        >
          <p className="text-sm text-body">
            {state.fallbackMessageIt}
          </p>
        </section>
      )}

      {/* Note */}
      <section className="glass-elevated rounded-2xl p-5 space-y-2">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Nota
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-light)" }}
        >
          {state.note || "Nessuna nota salvata per questa memoria."}
        </p>
      </section>

      {/* Oracle card */}
      <section className="glass-elevated rounded-2xl p-5 space-y-2">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Carta oracolo
        </h2>
        {state.card ? (
          <>
            <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {state.card.name}
            </p>
            <p className="text-sm leading-relaxed text-body">
              {state.card.description}
            </p>
          </>
        ) : (
          <p className="text-sm text-subtle">
            Dettaglio carta non disponibile.
          </p>
        )}
      </section>

      {/* Remedy */}
      <section className="glass-elevated rounded-2xl p-5 space-y-2">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Rimedio
        </h2>
        {state.remedy ? (
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-light)" }}>
            {state.remedy.text}
          </p>
        ) : (
          <p className="text-sm text-subtle">
            Dettaglio rimedio non disponibile.
          </p>
        )}
      </section>
    </main>
  );
}
