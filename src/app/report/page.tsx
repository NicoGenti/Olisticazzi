"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getLogsForRange } from "@/services/db";
import { getMoodLevel } from "@/lib/moodConfig";
import type { MoodLog } from "@/types/mood";
import FilterBar from "@/components/report/FilterBar";
import MoodChart from "@/components/report/MoodChart";
import ChartErrorBoundary from "@/components/report/ChartErrorBoundary";
import { computeStatsForRange } from "@/services/reportStats";
import type { ReportStats } from "@/services/reportStats";
import type { Range } from "@/types/report";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const } },
};

const TREND_CONFIG = {
  rising: { icon: "↑", label: "In crescita", color: "#10b981" },
  stable: { icon: "→", label: "Stabile", color: "#8b5cf6" },
  falling: { icon: "↓", label: "In calo", color: "#f97316" },
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <div
      className="glass-elevated rounded-2xl p-4 flex flex-col gap-2"
      style={{ boxShadow: `0 0 18px ${color}18` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-xl font-bold font-display" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function InsightCard({ stats }: { stats: ReportStats }) {
  let insight = "";
  let icon = "💡";

  if (stats.trend === "rising") {
    insight = "Il tuo umore è in crescita. Continua così! Identifica cosa ti sta dando energia.";
    icon = "🌱";
  } else if (stats.trend === "falling") {
    insight = "Il tuo umore sta calando. Ricordati di prenderti cura di te — anche i giorni grigi passano.";
    icon = "🌧️";
  } else if (stats.avgScore >= 7) {
    insight = "In media ti senti bene. Il tuo ritmo emotivo è positivo.";
    icon = "☀️";
  } else if (stats.avgScore <= 4) {
    insight = "Stai attraversando un periodo difficile. Considera di condividere i tuoi stati con qualcuno di fiducia.";
    icon = "💜";
  } else {
    insight = "Il tuo umore è equilibrato. Continuare a registrare ti aiuterà a scoprire i tuoi pattern.";
    icon = "🔮";
  }

  return (
    <div
      className="glass rounded-2xl p-5 flex gap-4"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.08) 100%)",
        border: "1px solid rgba(139,92,246,0.24)",
      }}
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted">
          Insight
        </p>
        <p className="text-sm leading-relaxed text-light">
          {insight}
        </p>
      </div>
    </div>
  );
}

function ReportContent() {
  const searchParams = useSearchParams();
  const range = (searchParams.get("range") ?? "7") as Range;

  const [allLogs, setAllLogs] = useState<MoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    void getLogsForRange(range)
      .then((logs) => { setAllLogs(logs); })
      .catch(() => { setAllLogs([]); })
      .finally(() => { setIsLoading(false); });
  }, [range]);

  const stats = computeStatsForRange(allLogs);

  const rangeLabel = range === "all" ? "Tutto" : `${range} giorni`;

  return (
    <main className="flex flex-col gap-4 px-4 pt-10 pb-4">
      <header className="text-center pb-2">
        <p
          className="text-xs uppercase tracking-[0.18em] text-muted"
        >
          Statistiche
        </p>
        <h1
          className="font-display text-2xl font-bold mt-1"
          style={{ color: "var(--text-primary)" }}
        >
          Il tuo Report
        </h1>
      </header>

      <FilterBar />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="font-display text-lg animate-pulse" style={{ color: "var(--accent-violet)" }}>
            Caricamento...
          </span>
        </div>
      )}

      {!isLoading && allLogs.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center space-y-3 mt-4">
          <span className="text-4xl block">📊</span>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Nessun dato disponibile
          </p>
          <p className="text-sm text-subtle">
            Inizia a registrare il tuo umore per vedere i tuoi trend qui.
          </p>
        </div>
      )}

      {!isLoading && allLogs.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            {(() => {
              const avgLevel = getMoodLevel(Math.round(stats.avgScore));
              return (
                <MetricCard
                  label="Umore medio"
                  value={`${stats.avgScore}/10`}
                  icon={avgLevel.emoji}
                  color={avgLevel.color}
                />
              );
            })()}
            <MetricCard
              label="Sessioni totali"
              value={String(stats.totalLogs)}
              icon="📝"
              color="var(--accent-violet)"
            />
            <MetricCard
              label="Streak positivo"
              value={`${stats.positiveStreak} gg`}
              icon="🔥"
              color="var(--accent-cyan)"
            />
            <MetricCard
              label="Streak negativo"
              value={`${stats.negativeStreak} gg`}
              icon="❄️"
              color="var(--accent-violet)"
            />
            <MetricCard
              label="Trend"
              value={TREND_CONFIG[stats.trend].label}
              icon={TREND_CONFIG[stats.trend].icon}
              color={TREND_CONFIG[stats.trend].color}
            />
            <MetricCard
              label="Picco massimo"
              value={`${stats.highestScore}/10`}
              icon="⬆️"
              color="#10b981"
            />
            <MetricCard
              label="Picco minimo"
              value={`${stats.lowestScore}/10`}
              icon="⬇️"
              color="#f97316"
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="glass rounded-2xl p-5 space-y-4">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Andamento umore — {rangeLabel}
              </p>
              <ChartErrorBoundary>
                <MoodChart logs={allLogs} range={range} />
              </ChartErrorBoundary>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <InsightCard stats={stats} />
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="glass rounded-2xl p-4 space-y-2">
              <p
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Legenda umore
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[0, 3, 5, 7, 9, 10].map((score) => {
                  const level = getMoodLevel(score);
                  return (
                    <div key={score} className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="text-xs text-body">
                        {score} — {level.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

function Loading() {
  return (
    <main className="flex flex-col gap-4 px-4 pt-10 pb-4">
      <header className="text-center pb-2">
        <p
          className="text-xs uppercase tracking-[0.18em] text-muted"
        >
          Statistiche
        </p>
        <h1
          className="font-display text-2xl font-bold mt-1"
          style={{ color: "var(--text-primary)" }}
        >
          Il tuo Report
        </h1>
      </header>
      <div className="flex items-center justify-center py-16">
        <span className="font-display text-lg animate-pulse" style={{ color: "var(--accent-violet)" }}>
          Caricamento...
        </span>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportContent />
    </Suspense>
  );
}
