"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAllFavorites } from "@/hooks/useAllFavorites";
import { removeFavorite } from "@/services/db";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import oracleCards from "@/data/oracle_seed.json";
import aphorisms from "@/data/aphorisms_seed.json";
import sticazzi from "@/data/sticazzi_seed.json";
import type { FavoriteEntry, OracleCard, AphorismEntry, SticazziEntry } from "@/types/oracle";

const typedOracleCards = oracleCards as OracleCard[];
const typedAphorisms = aphorisms as AphorismEntry[];
const typedSticazzi = sticazzi as SticazziEntry[];

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  oracle: { label: "Carte Oracolo", emoji: "🔮" },
  aphorism: { label: "Aforismi", emoji: "🌿" },
  sticazzi: { label: "Sticazzi", emoji: "🎲" },
};

const TYPE_ORDER = ["oracle", "aphorism", "sticazzi"];

export default function FavoritesPage() {
  const { favorites, loading } = useAllFavorites();

  const grouped = useMemo(() => {
    const groups: Record<string, FavoriteEntry[]> = {};
    for (const fav of favorites) {
      if (!groups[fav.type]) groups[fav.type] = [];
      groups[fav.type].push(fav);
    }
    return groups;
  }, [favorites]);

  const handleRemove = async (type: FavoriteEntry["type"], contentId: string) => {
    await removeFavorite(type, contentId);
    // live query updates the UI automatically
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const hasFavorites = favorites.length > 0;

  return (
    <main className="flex flex-col gap-4 px-4 pt-10 pb-4">
      {/* Header */}
      <header className="text-center pb-2">
        <p
          className="text-xs uppercase tracking-[0.18em] text-muted"
        >
          I tuoi contenuti
        </p>
        <h1
          className="font-display text-2xl font-bold mt-1"
          style={{ color: "var(--text-primary)" }}
        >
          Preferiti
        </h1>
      </header>

      {!hasFavorites ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.36 }}
            className="flex flex-col items-center gap-5 py-8 text-center"
          >
            <span className="text-5xl" aria-hidden="true">💜</span>
            <div className="glass rounded-2xl p-6 max-w-xs w-full space-y-3">
              <p className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Nessun preferito ancora
              </p>
              <p className="text-sm text-soft">
                Tocca il cuore ♡ sulle carte oracolo, aforismi e frasi sticazzi per salvarle qui.
              </p>
            </div>
            <Link
              href="/"
              className="btn-primary max-w-xs"
              style={{ maxWidth: 240 }}
            >
              Scopri i contenuti
            </Link>
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          {TYPE_ORDER.map((type) => {
            const entries = grouped[type];
            if (!entries || entries.length === 0) return null;
            const typeInfo = TYPE_LABELS[type];

            return (
              <motion.section
                key={type}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden>{typeInfo.emoji}</span>
                  <h2
                    className="text-sm font-semibold uppercase tracking-wider text-subtle"
                  >
                    {typeInfo.label}
                  </h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-muted"
                    style={{
                      background: "var(--glass-bg-soft)",
                      border: "1px solid var(--glass-border-soft)",
                    }}
                  >
                    {entries.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {entries.map((fav) => (
                    <FavoriteItem
                      key={fav.id}
                      favorite={fav}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
      )}
    </main>
  );
}

interface FavoriteItemProps {
  favorite: FavoriteEntry;
  onRemove: (type: FavoriteEntry["type"], contentId: string) => void;
}

function FavoriteItem({ favorite, onRemove }: FavoriteItemProps) {
  const content = resolveContent(favorite);

  return (
    <div
      className="glass rounded-2xl p-4 flex items-start gap-3"
      style={{
        background: "var(--glass-bg-soft)",
        border: "1px solid var(--glass-border-soft)",
      }}
    >
      <div className="flex-1 min-w-0">
        {content.name && (
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {content.name}
          </p>
        )}
        <p
          className="text-sm leading-relaxed line-clamp-2 text-body"
        >
          {content.text}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(favorite.type, favorite.contentId)}
        className="shrink-0 text-sm px-2 py-1 rounded-lg transition-colors"
        style={{
          background: "var(--red-bg)",
          border: "1px solid var(--red-border)",
          color: "var(--red-text)",
        }}
        aria-label="Rimuovi dai preferiti"
      >
        ♥
      </button>
    </div>
  );
}

function resolveContent(favorite: FavoriteEntry): { name?: string; text: string } {
  switch (favorite.type) {
    case "oracle": {
      const card = typedOracleCards.find((c) => c.id === favorite.contentId);
      return card
        ? { name: card.name, text: card.description }
        : { text: favorite.contentId };
    }
    case "aphorism": {
      const aph = typedAphorisms.find((a) => a.id === favorite.contentId);
      return aph
        ? { text: aph.text }
        : { text: favorite.contentId };
    }
    case "sticazzi": {
      const stc = typedSticazzi.find((s) => s.id === favorite.contentId);
      return stc
        ? { text: stc.text }
        : { text: favorite.contentId };
    }
    default:
      return { text: favorite.contentId };
  }
}
