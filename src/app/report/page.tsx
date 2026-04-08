"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllLogs } from "@/services/db";
import { calculateMoodTrend } from "@/services/moodTrend";
import { getMoodLevel } from "@/lib/moodConfig";
import type { MoodLog } from "@/types/mood";

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

interface ReportData {
  totalLogs: number;
  avgScore: number;
  trend: "rising" | "stable" | "falling";
  last7: MoodLog[];
  highestScore: number;
  lowestScore: number;
  streakDays: number;
}

function computeReport(logs: MoodLog[]): ReportData {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      avgScore: 0,
      trend: "stable",
      last7: [],
      highestScore: 0,
      lowestScore: 0,
      streakDays: 0,
    };
  }

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const last7 = sorted.slice(0, 7);
  const recentForTrend = sorted.slice(1, 4); // skip today for trend calc
  const todayScore = sorted[0]?.moodScore ?? 5;
  const trend = calculateMoodTrend(recentForTrend, todayScore);

  const totalScore = logs.reduce((sum, l) => sum + l.moodScore, 0);
  const avgScore = Math.round((totalScore / logs.length) * 10) / 10;
  const highestScore = Math.max(...logs.map((l) => l.moodScore));
  const lowestScore = Math.min(...logs.map((l) => l.moodScore));

  // Compute current streak: consecutive days ending today
  let streakDays = 0;
  const today = new Date().toLocaleDateString("sv-SE");
  const dateSet = new Set(logs.map((l) => l.date));
  let cursor = new Date(today);

  while (dateSet.has(cursor.toLocaleDateString("sv-SE"))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalLogs: logs.length,
    avgScore,
    trend,
    last7,
    highestScore,
    lowestScore,
    streakDays,
  };
}

const TREND_CONFIG = {
  rising: { icon: "↑", label: "In crescita", color: "#10b981" },
  stable: { icon: "→", label: "Stabile", color: "#8b5cf6" },
  falling: { icon: "↓", label: "In calo", color: "#f97316" },
};

export default function ReportPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    void getAllLogs()
      .then((logs) => setReport(computeReport(logs)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="flex flex-col gap-4 px-4 pt-10 pb-4">
      {/* Header */}
      <header className="text-center pb-2">
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: "rgba(245,247,255,0.4)" }}
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

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="font-display text-lg animate-pulse" style={{ color: "var(--accent-violet)" }}>
            Caricamento...
          </span>
        </div>
      )}

      {!isLoading && report && report.totalLogs === 0 && (
        <div className="glass rounded-2xl p-6 text-center space-y-3 mt-4">
          <span className="text-4xl block">📊</span>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Nessun dato disponibile
          </p>
          <p className="text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>
            Inizia a registrare il tuo umore per vedere i tuoi trend qui.
          </p>
        </div>
      )}

      {!isLoading && report && report.totalLogs > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {/* Metric tiles grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Umore medio"
              value={`${report.avgScore}/10`}
              icon={getMoodLevel(Math.round(report.avgScore)).emoji}
              color={getMoodLevel(Math.round(report.avgScore)).color}
            />
            <MetricCard
              label="Sessioni totali"
              value={String(report.totalLogs)}
              icon="📝"
              color="var(--accent-violet)"
            />
            <MetricCard
              label="Streak corrente"
              value={`${report.streakDays} gg`}
              icon="🔥"
              color="var(--accent-cyan)"
            />
            <MetricCard
              label="Trend"
              value={TREND_CONFIG[report.trend].label}
              icon={TREND_CONFIG[report.trend].icon}
              color={TREND_CONFIG[report.trend].color}
            />
          </motion.div>

          {/* High / Low */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Picco massimo"
              value={`${report.highestScore}/10`}
              icon="⬆️"
              color="#10b981"
            />
            <MetricCard
              label="Picco minimo"
              value={`${report.lowestScore}/10`}
              icon="⬇️"
              color="#f97316"
            />
          </motion.div>

          {/* Last 7 days mini chart */}
          <motion.div variants={fadeUp}>
            <div className="glass rounded-2xl p-5 space-y-4">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Ultimi 7 giorni
              </p>
              <MiniMoodChart logs={report.last7} />
            </div>
          </motion.div>

          {/* Insight card */}
          <motion.div variants={fadeUp}>
            <InsightCard report={report} />
          </motion.div>

          {/* Legend */}
          <motion.div variants={fadeUp}>
            <div className="glass rounded-2xl p-4 space-y-2">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "rgba(245,247,255,0.4)" }}
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
                      <span className="text-xs" style={{ color: "rgba(245,247,255,0.65)" }}>
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

/* ─── MetricCard ─── */

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
        <span className="text-xs" style={{ color: "rgba(245,247,255,0.45)" }}>{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <p className="text-xl font-bold font-display" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

/* ─── MiniMoodChart ─── */

function MiniMoodChart({ logs }: { logs: MoodLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-center py-4" style={{ color: "rgba(245,247,255,0.4)" }}>
        Nessun dato
      </p>
    );
  }

  const reversed = [...logs].reverse(); // oldest first
  const max = 10;

  return (
    <div className="flex items-end gap-1.5 h-16">
      {reversed.map((log) => {
        const level = getMoodLevel(log.moodScore);
        const heightPct = (log.moodScore / max) * 100;
        const dateLabel = new Date(`${log.date}T00:00:00`).toLocaleDateString("it-IT", {
          day: "numeric",
          month: "short",
        });

        return (
          <div key={log.date} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex items-end" style={{ height: "100%" }}>
              <motion.div
                className="w-full rounded-sm"
                style={{ backgroundColor: level.color, opacity: 0.85 }}
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                title={`${dateLabel}: ${log.moodScore}/10`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── InsightCard ─── */

function InsightCard({ report }: { report: ReportData }) {
  let insight = "";
  let icon = "💡";

  if (report.trend === "rising") {
    insight = "Il tuo umore è in crescita. Continua così! Identifica cosa ti sta dando energia.";
    icon = "🌱";
  } else if (report.trend === "falling") {
    insight = "Il tuo umore sta calando. Ricordati di prenderti cura di te — anche i giorni grigi passano.";
    icon = "🌧️";
  } else if (report.avgScore >= 7) {
    insight = "In media ti senti bene. Il tuo ritmo emotivo è positivo.";
    icon = "☀️";
  } else if (report.avgScore <= 4) {
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
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(245,247,255,0.4)" }}>
          Insight
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,247,255,0.75)" }}>
          {insight}
        </p>
      </div>
    </div>
  );
}
