import Dexie, { type Table } from "dexie";
import { z } from "zod";

import { getTodayDateString } from "@/lib/date";
import type { Range } from "@/types/report";
import type { FavoriteEntry, FavoriteType } from "@/types/oracle";
import type { MoodEntry, MoodLog } from "@/types/mood";

const LOCAL_STORAGE_KEY = "moonmood_logs";

const moodLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  moodScore: z.number().min(0).max(10),
  note: z.string().max(280).optional(),
  moonPhase: z.string().optional(),
  oracleCardId: z.string().optional(),
  oracleRemedyId: z.string().optional(),
});

const storedMoodLogSchema = moodLogSchema.extend({
  id: z.string().uuid(),
  createdAt: z.number().int().positive(),
});

class MoonmoodDB extends Dexie {
  dailyLogs!: Table<MoodLog>;
  favorites!: Table<FavoriteEntry>;

  constructor() {
    super("MoonmoodDB");
    this.version(1).stores({
      dailyLogs: "id, date, createdAt",
    });
    this.version(2).stores({
      dailyLogs: "id, date, createdAt, moonPhase, oracleCardId",
    });
    this.version(3).stores({
      dailyLogs: "id, date, createdAt, moonPhase, oracleCardId",
      favorites: "id, type, contentId, savedAt",
    });
    this.version(4)
      .stores({
        dailyLogs: "id, date, createdAt, moonPhase, oracleCardId",
        favorites: "id, &[type+contentId], savedAt",
      })
      .upgrade(async (tx) => {
        // Remove duplicate [type+contentId] pairs before adding the unique index.
        // Keep the entry with the highest savedAt for each pair.
        const all = await tx.table<FavoriteEntry>("favorites").toArray();
        const seen = new Map<string, string>();
        const toDelete: string[] = [];

        for (const fav of [...all].sort((a, b) => b.savedAt - a.savedAt)) {
          const key = `${fav.type}:${fav.contentId}`;
          if (seen.has(key)) {
            toDelete.push(fav.id);
          } else {
            seen.set(key, fav.id);
          }
        }

        if (toDelete.length > 0) {
          await tx.table("favorites").bulkDelete(toDelete);
        }
      });
  }
}

export const db = new MoonmoodDB();

function dedupeByDate(logs: MoodLog[]): { deduped: MoodLog[]; removedCount: number } {
  const sorted = [...logs].sort((a, b) => {
    if (b.createdAt !== a.createdAt) {
      return b.createdAt - a.createdAt;
    }
    return b.id.localeCompare(a.id);
  });

  const seenDates = new Set<string>();
  const deduped: MoodLog[] = [];
  let removedCount = 0;

  for (const log of sorted) {
    if (seenDates.has(log.date)) {
      removedCount += 1;
      continue;
    }
    seenDates.add(log.date);
    deduped.push(log);
  }

  return { deduped, removedCount };
}

function readLocalStorageLogs(): MoodLog[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.reduce<MoodLog[]>((acc, item) => {
      const result = storedMoodLogSchema.safeParse(item);
      if (result.success) {
        acc.push(result.data as MoodLog);
      }
      return acc;
    }, []);
  } catch {
    return [];
  }
}

function writeLocalStorageLogs(logs: MoodLog[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
}

export async function saveMoodLog(entry: MoodEntry & { id?: string; createdAt?: number }): Promise<MoodLog> {
  moodLogSchema.parse(entry);

  const log: MoodLog = {
    ...entry,
    id: entry.id ?? crypto.randomUUID(),
    createdAt: entry.createdAt ?? Date.now(),
  };

  try {
    await db.dailyLogs.put(log);
  } catch {
    const existing = readLocalStorageLogs();
    const idx = existing.findIndex((l) => l.id === log.id);
    if (idx >= 0) {
      existing[idx] = log;
    } else {
      existing.push(log);
    }
    writeLocalStorageLogs(existing);
  }

  return log;
}

export async function dedupeDailyLogs(): Promise<number> {
  try {
    const allLogs = await db.dailyLogs.toArray();
    let removedFromDexie = 0;

    const { deduped, removedCount } = dedupeByDate(allLogs);
    if (removedCount > 0) {
      const keepIds = new Set(deduped.map((log) => log.id));
      const idsToDelete = allLogs.filter((log) => !keepIds.has(log.id)).map((log) => log.id);

      await db.transaction("rw", db.dailyLogs, async () => {
        for (const id of idsToDelete) {
          await db.dailyLogs.delete(id);
        }
      });

      removedFromDexie = removedCount;
    }

    const localLogs = readLocalStorageLogs();
    const { deduped: dedupedLocalLogs, removedCount: removedFromLocalStorage } = dedupeByDate(localLogs);
    if (removedFromLocalStorage > 0) {
      writeLocalStorageLogs(dedupedLocalLogs);
    }

    return removedFromDexie + removedFromLocalStorage;
  } catch {
    const allLogs = readLocalStorageLogs();
    const { deduped, removedCount } = dedupeByDate(allLogs);
    if (removedCount > 0) {
      writeLocalStorageLogs(deduped);
    }
    return removedCount;
  }
}

export async function getTodayLog(): Promise<MoodLog | null> {
  const today = getTodayDateString();

  try {
    const logs = await db.dailyLogs.where("date").equals(today).toArray();
    if (logs.length > 0) {
      logs.sort((a, b) => b.createdAt - a.createdAt);
      return logs[0];
    }

    const fallback = readLocalStorageLogs();
    return fallback
      .filter((item) => item.date === today)
      .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  } catch {
    const all = readLocalStorageLogs();
    return all
      .filter((log) => log.date === today)
      .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
  }
}

export async function getAllLogs(): Promise<MoodLog[]> {
  try {
    const dexieLogs = await db.dailyLogs.orderBy("createdAt").reverse().toArray();
    if (dexieLogs.length > 0) {
      return dexieLogs;
    }

    return readLocalStorageLogs().sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return readLocalStorageLogs().sort((a, b) => b.createdAt - a.createdAt);
  }
}

export async function getRecentLogs(before: string, limit: number): Promise<MoodLog[]> {
  try {
    const logs = await db.dailyLogs
      .where("date")
      .below(before)
      .reverse()
      .limit(limit)
      .toArray();
    if (logs.length > 0) return logs;
    return readLocalStorageLogs()
      .filter((l) => l.date < before)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  } catch {
    return readLocalStorageLogs()
      .filter((l) => l.date < before)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }
}

export async function getLogsPage(offset: number, limit: number): Promise<MoodLog[]> {
  try {
    return await db.dailyLogs
      .orderBy("createdAt")
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  } catch {
    const all = readLocalStorageLogs().sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(offset, offset + limit);
  }
}

export async function getLogsCount(): Promise<number> {
  try {
    return await db.dailyLogs.count();
  } catch {
    return readLocalStorageLogs().length;
  }
}

export async function getLogsForRange(range: Range): Promise<MoodLog[]> {
  if (range === "all") {
    return getAllLogs();
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(range, 10));
  cutoff.setHours(0, 0, 0, 0);
  const cutoffStr = cutoff.toLocaleDateString("sv-SE");
  try {
    const logs = await db.dailyLogs
      .where("date")
      .aboveOrEqual(cutoffStr)
      .reverse()
      .toArray();
    if (logs.length > 0) return logs;
    return readLocalStorageLogs()
      .filter((l) => l.date >= cutoffStr)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return readLocalStorageLogs()
      .filter((l) => l.date >= cutoffStr)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

export async function addFavorite(
  type: FavoriteType,
  contentId: string,
): Promise<FavoriteEntry> {
  const entry: FavoriteEntry = {
    id: crypto.randomUUID(),
    type,
    contentId,
    savedAt: Date.now(),
  };
  try {
    await db.favorites.add(entry);
  } catch (err) {
    if (err instanceof Dexie.ConstraintError) {
      // Unique constraint violation — entry already exists, return the existing one
      const existing = await db.favorites.where({ type, contentId }).first();
      if (existing) return existing;
    } else {
      throw err;
    }
  }
  return entry;
}

export async function removeFavorite(
  type: FavoriteType,
  contentId: string,
): Promise<void> {
  await db.favorites.where({ type, contentId }).delete();
}

export async function isFavorite(
  type: FavoriteType,
  contentId: string,
): Promise<boolean> {
  const count = await db.favorites
    .where({ type, contentId })
    .count();
  return count > 0;
}

export async function getAllFavorites(): Promise<FavoriteEntry[]> {
  return db.favorites.orderBy("savedAt").reverse().toArray();
}

export async function clearAllLocalData(): Promise<void> {
  await db.dailyLogs.clear();
  await db.favorites.clear();
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
