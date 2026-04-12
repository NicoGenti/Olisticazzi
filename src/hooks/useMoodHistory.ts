"use client";

import { useEffect, useState, useCallback } from "react";
import { getLogsPage, getLogsCount } from "@/services/db";
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
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const pageSize = limit ?? PAGE_SIZE;

  // Load a page of logs — on the first page, count and logs are fetched together
  // to avoid the race condition where hasMore = false before count resolves
  const loadPage = useCallback(
    async (currentOffset: number) => {
      setIsLoading(true);
      try {
        if (currentOffset === 0) {
          const [page, count] = await Promise.all([
            getLogsPage(0, pageSize),
            getLogsCount(),
          ]);
          setTotalCount(count);
          setLogs(page);
        } else {
          const page = await getLogsPage(currentOffset, pageSize);
          setLogs((prev) => [...prev, ...page]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    void loadPage(offset);
  }, [offset, loadPage]);

  const page = buildMoodHistoryPage(logs, logs.length, oracleCardsById);

  function loadMore() {
    setOffset((prev) => prev + pageSize);
  }

  const hasMore = logs.length < totalCount;

  return {
    groups: page.groups,
    hasMore,
    totalCount,
    isLoading,
    loadMore,
  };
}
