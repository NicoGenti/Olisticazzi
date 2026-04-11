import type { MoonPhaseName } from "@/types/astrology";

export interface OracleCard {
  id: string;
  name: string; // Italian card name
  description: string; // Italian, 1-3 sentences
  moodRange: [number, number]; // [min, max] inclusive
  moonPhases: MoonPhaseName[]; // matching lunar phases
  tags: string[]; // Italian tags, e.g. ['introspezione', 'chiarezza']
  isDefault?: boolean; // fallback card marker (D-14)
}

export interface Remedy {
  id: string;
  text: string; // Italian, 1-2 sentences
  linkedCardId: string; // FK to OracleCard.id
  category: string; // e.g. 'meditazione', 'natura', 'scrittura'
}

export interface AphorismEntry {
  id: string;
  text: string; // Italian aphorism
}

export interface SticazziEntry {
  id: string;
  text: string; // Italian ironic/humorous phrase
}

export type MoodTrend = "rising" | "falling" | "stable";

export interface OracleSelectionInput {
  moodScore: number;
  moonPhase: MoonPhaseName;
  trend: MoodTrend;
}

export interface OracleSelectionResult {
  card: OracleCard;
  remedy: Remedy;
}

export type FavoriteType = "oracle" | "aphorism" | "sticazzi";

export interface FavoriteEntry {
  id: string;
  type: FavoriteType;
  contentId: string;
  savedAt: number;
}
