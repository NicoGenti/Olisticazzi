"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMoodHistory } from "@/hooks/useMoodHistory";

function formatDateIt(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function MoodHistory() {
  const { groups, hasMore, loadMore, isLoading } = useMoodHistory();

  if (isLoading) {
    return null;
  }

  if (groups.length === 0) {
    return (
      <div
        className="w-full rounded-2xl p-5 text-center space-y-3"
        style={{
          background: "var(--glass-bg-soft)",
          border: "1px solid var(--glass-border-soft)",
        }}
      >
        <p className="text-base font-semibold" style={{ color: "rgba(245,247,255,0.85)" }}>
          Le tue memorie stanno aspettando.
        </p>
        <p className="text-sm" style={{ color: "rgba(245,247,255,0.5)" }}>
          Ogni nota salvata ti aiuta a riconoscere il tuo ritmo interiore.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-full px-4 py-2 text-sm transition"
          style={{
            border: "1px solid var(--glass-border-soft)",
            background: "var(--glass-bg-soft)",
            color: "rgba(245,247,255,0.75)",
          }}
        >
          Torna a registrare l&apos;umore
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <motion.section
            key={group.monthKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.04, duration: 0.26 }}
            className="space-y-2"
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "rgba(245,247,255,0.4)" }}
            >
              {group.monthLabelIt}
            </h2>

            <div className="space-y-2">
              {group.items.map((item) => (
                <Link
                  key={item.date}
                  href={`/history?date=${item.date}`}
                  className="block rounded-xl px-3 py-2.5 transition"
                  style={{
                    border: "1px solid var(--glass-border-soft)",
                    background: "var(--glass-bg-soft)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm" style={{ color: "rgba(245,247,255,0.9)" }}>
                        {formatDateIt(item.date)}
                      </p>
                      <p className="truncate text-xs mt-0.5" style={{ color: "rgba(245,247,255,0.5)" }}>
                        {item.oracleCardName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(245,247,255,0.8)" }}>
                      <span>{item.scoreEmoji}</span>
                      <span className="font-medium">{item.moodScore}/10</span>
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.scoreColorToken }}
                        aria-hidden
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          className="w-full rounded-full py-2.5 text-sm transition"
          style={{
            border: "1px solid var(--glass-border-soft)",
            background: "var(--glass-bg-soft)",
            color: "rgba(245,247,255,0.7)",
          }}
        >
          Carica altre memorie
        </button>
      )}
    </div>
  );
}
