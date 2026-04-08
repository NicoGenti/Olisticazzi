import type { MoodScore } from "@/types/mood";

export interface HistoryListItem {
  date: string;
  moodScore: MoodScore;
  scoreEmoji: string;
  scoreColorToken: string;
  oracleCardName: string;
}

export interface HistoryMonthGroup {
  monthKey: string;
  monthLabelIt: string;
  items: HistoryListItem[];
}

export interface MoodHistoryPageResult {
  groups: HistoryMonthGroup[];
  hasMore: boolean;
  visibleCount: number;
  totalCount: number;
}
