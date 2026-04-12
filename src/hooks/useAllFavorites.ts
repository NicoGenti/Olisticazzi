"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllFavorites } from "@/services/db";
import type { FavoriteEntry } from "@/types/oracle";

interface UseAllFavoritesResult {
  favorites: FavoriteEntry[];
  loading: boolean;
  refetch: () => void;
}

export function useAllFavorites(): UseAllFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const result = await getAllFavorites();
      setFavorites(result);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return { favorites, loading, refetch: loadFavorites };
}
