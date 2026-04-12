"use client";

import sticazzi from "@/data/sticazzi_seed.json";
import { getDailySticazzi } from "@/services/sticazziSelector";
import { useSticazziEnabled } from "@/hooks/useSettings";
import { useFavorite } from "@/hooks/useFavorite";
import { ContentCard } from "@/components/ui/ContentCard";
import type { SticazziEntry } from "@/types/oracle";

export function SticazziCard() {
  const enabled = useSticazziEnabled();
  const entry = getDailySticazzi(new Date(), sticazzi as SticazziEntry[]);
  const { favorited, toggle, animating } = useFavorite("sticazzi", entry?.id ?? "");

  if (!enabled || !entry) return null;

  return (
    <ContentCard
      icon="🎲"
      title="Sticazzi"
      text={entry.text}
      gradient="linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(234,88,12,0.06) 100%)"
      borderColor="rgba(251,146,60,0.22)"
      accentColor="var(--orange-text)"
      favorited={favorited}
      animating={animating}
      onToggleFavorite={toggle}
      ariaLabel="Sticazzi — frase ironica quotidiana"
    />
  );
}
