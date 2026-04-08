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
      <div className="w-full rounded-2xl border border-surface-15 bg-surface-10 p-5 text-center space-y-3">
        <p className="text-base font-semibold text-white/85">Le tue memorie stanno aspettando.</p>
        <p className="text-sm text-white/60">Ogni nota salvata ti aiuta a riconoscere il tuo ritmo interiore.</p>
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85 transition-colors hover:bg-white/20"
        >
          Torna a registrare l&apos;umore
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-surface-15 bg-surface-10 p-4 space-y-4">
      <div className="space-y-4">
        {groups.map((group, groupIndex) => (
          <motion.section
            key={group.monthKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.04, duration: 0.28 }}
            className="space-y-2"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">{group.monthLabelIt}</h2>

            <div className="space-y-2">
              {group.items.map((item) => (
                <Link
                  key={item.date}
                  href={`/history/${item.date}`}
                  className="block rounded-xl border border-white/10 bg-black/10 px-3 py-2 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white/90">{formatDateIt(item.date)}</p>
                      <p className="truncate text-xs text-white/60">{item.oracleCardName}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span>{item.scoreEmoji}</span>
                      <span className="font-medium">{item.moodScore}/10</span>
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
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
          className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85 transition-colors hover:bg-white/20"
        >
          Carica altre memorie
        </button>
      )}
    </div>
  );
}
