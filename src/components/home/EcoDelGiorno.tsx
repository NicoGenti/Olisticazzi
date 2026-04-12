"use client";

import aphorisms from "@/data/aphorisms_seed.json";
import { getDailyAphorism } from "@/services/aphorismSelector";
import { useEcoEnabled } from "@/hooks/useSettings";
import { useFavorite } from "@/hooks/useFavorite";
import { ContentCard } from "@/components/ui/ContentCard";
import type { AphorismEntry } from "@/types/oracle";

export function EcoDelGiorno() {
  const enabled = useEcoEnabled();
  const entry = getDailyAphorism(new Date(), aphorisms as AphorismEntry[]);
  const { favorited, toggle, animating } = useFavorite("aphorism", entry?.id ?? "");

  if (!enabled || !entry) return null;

  return (
    <ContentCard
      icon="🌿"
      title="Eco del Giorno"
      text={entry.text}
      gradient="linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(6,182,212,0.06) 100%)"
      borderColor="rgba(139,92,246,0.18)"
      accentColor="var(--violet-text)"
      favorited={favorited}
      animating={animating}
      onToggleFavorite={toggle}
      ariaLabel="Eco del Giorno — aforisma quotidiano"
      italic
    />
  );
}
