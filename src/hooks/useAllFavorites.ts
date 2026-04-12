"use client";

import { useState, useEffect } from "react";
import { liveQuery } from "dexie";
import { db } from "@/services/db";
import type { FavoriteEntry } from "@/types/oracle";

interface UseAllFavoritesResult {
  favorites: FavoriteEntry[];
  loading: boolean;
}

export function useAllFavorites(): UseAllFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.favorites.orderBy("savedAt").reverse().toArray()
    ).subscribe({
      next: (result) => {
        setFavorites(result);
        setLoading(false);
      },
      error: () => {
        setFavorites([]);
        setLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  return { favorites, loading };
}
