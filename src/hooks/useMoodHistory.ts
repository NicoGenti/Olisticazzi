"use client";

import { useEffect, useState } from "react";
import { getAllLogs } from "@/services/db";
import oracleCards from "@/data/oracle_seed.json";
import { buildMoodHistoryPage } from "@/hooks/moodHistoryViewModel";
import type { HistoryMonthGroup } from "@/types/history";
import type { MoodLog } from "@/types/mood";
import type { OracleCard } from "@/types/oracle";

const PAGE_SIZE = 12;
const oracleCardsById: Record<string, OracleCard> = (oracleCards as OracleCard[]).reduce<Record<string, OracleCard>>(
  (acc, card) => {
    acc[card.id] = card;
    return acc;
  },
  {}
);

export interface UseMoodHistoryReturn {
  groups: HistoryMonthGroup[];
  hasMore: boolean;
  totalCount: number;
  isLoading: boolean;
  loadMore: () => void;
}

export function useMoodHistory(limit?: number): UseMoodHistoryReturn {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [visibleCount, setVisibleCount] = useState(limit ?? PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getAllLogs()
      .then((allLogs) => {
        setLogs(allLogs);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const page = buildMoodHistoryPage(logs, visibleCount, oracleCardsById);

  function loadMore() {
    setVisibleCount((previous) => previous + PAGE_SIZE);
  }

  return {
    groups: page.groups,
    hasMore: page.hasMore,
    totalCount: page.totalCount,
    isLoading,
    loadMore,
  };
}
