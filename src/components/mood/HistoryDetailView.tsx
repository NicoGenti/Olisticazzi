"use client";

import type { HistoryDetailResolvedState } from "@/app/history/historyDetailState";

interface HistoryDetailViewProps {
  state: Exclude<HistoryDetailResolvedState, { status: "not-found" }>;
  onBack: () => void;
}

export function HistoryDetailView({ state, onBack }: HistoryDetailViewProps) {
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
          className="text-xs uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.4)" }}
        >
          Memoria
        </p>
        <h1
          className="font-display text-2xl font-bold capitalize"
          style={{ color: "var(--text-primary)" }}
        >
          {state.date}
        </h1>
        <p className="text-sm" style={{ color: "rgba(245,247,255,0.6)" }}>
          Umore: <strong>{state.moodScore}/10</strong>
        </p>
        {state.moonPhaseIt && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            style={{
              background: "var(--glass-bg-soft)",
              border: "1px solid var(--glass-border-soft)",
              color: "rgba(245,247,255,0.55)",
            }}
          >
            🌙 {state.moonPhaseIt}
          </div>
        )}
      </section>

      {state.status === "partial" && (
        <section
          className="glass rounded-xl p-4"
          style={{ borderColor: "rgba(249,115,22,0.3)", background: "rgba(249,115,22,0.08)" }}
        >
          <p className="text-sm" style={{ color: "rgba(245,247,255,0.7)" }}>
            {state.fallbackMessageIt}
          </p>
        </section>
      )}

      {/* Note */}
      <section className="glass-elevated rounded-2xl p-5 space-y-2">
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.45)" }}
        >
          Nota
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(245,247,255,0.82)" }}
        >
          {state.note || "Nessuna nota salvata per questa memoria."}
        </p>
      </section>

      {/* Oracle card */}
      <section className="glass-elevated rounded-2xl p-5 space-y-2">
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.45)" }}
        >
          Carta oracolo
        </h2>
        {state.card ? (
          <>
            <p className="text-base font-semibold" style={{ color: "rgba(245,247,255,0.9)" }}>
              {state.card.name}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.72)" }}>
              {state.card.description}
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>
            Dettaglio carta non disponibile.
          </p>
        )}
      </section>

      {/* Remedy */}
      <section className="glass-elevated rounded-2xl p-5 space-y-2">
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "rgba(245,247,255,0.45)" }}
        >
          Rimedio
        </h2>
        {state.remedy ? (
          <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.82)" }}>
            {state.remedy.text}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>
            Dettaglio rimedio non disponibile.
          </p>
        )}
      </section>
    </main>
  );
}
