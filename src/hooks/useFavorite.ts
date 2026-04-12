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
    if (!contentId) return;
    let cancelled = false;
    isFavorite(type, contentId).then((result) => {
      if (!cancelled) setFavorited(result);
    });
    return () => {
      cancelled = true;
    };
  }, [type, contentId]);

  const toggle = useCallback(async () => {
    if (!contentId) return;
    setAnimating(true);
    try {
      if (favorited) {
        await removeFavorite(type, contentId);
        setFavorited(false);
      } else {
        await addFavorite(type, contentId);
        setFavorited(true);
      }
    } finally {
      setTimeout(() => setAnimating(false), 300);
    }
  }, [favorited, type, contentId]);

  return { favorited, toggle, animating };
}
