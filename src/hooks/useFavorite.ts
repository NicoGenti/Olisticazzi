"use client";

import { useState, useEffect, useCallback } from "react";
import { isFavorite, addFavorite, removeFavorite } from "@/services/db";
import type { FavoriteType } from "@/types/oracle";

interface UseFavoriteResult {
  favorited: boolean;
  toggle: () => Promise<void>;
  animating: boolean;
}

export function useFavorite(
  type: FavoriteType,
  contentId: string,
): UseFavoriteResult {
  const [favorited, setFavorited] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isFavorite(type, contentId).then((result) => {
      if (!cancelled) setFavorited(result);
    });
    return () => {
      cancelled = true;
    };
  }, [type, contentId]);

  const toggle = useCallback(async () => {
    setAnimating(true);
    if (favorited) {
      await removeFavorite(type, contentId);
      setFavorited(false);
    } else {
      await addFavorite(type, contentId);
      setFavorited(true);
    }
    setTimeout(() => setAnimating(false), 300);
  }, [favorited, type, contentId]);

  return { favorited, toggle, animating };
}
