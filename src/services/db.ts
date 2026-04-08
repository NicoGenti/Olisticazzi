import Dexie, { type Table } from "dexie";
import { z } from "zod";

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

  constructor() {
    super("MoonmoodDB");
    this.version(1).stores({
      dailyLogs: "id, date, createdAt",
    });
    this.version(2).stores({
      dailyLogs: "id, date, createdAt, moonPhase, oracleCardId",
    });
  }
}

export const db = new MoonmoodDB();

function getTodayDateString(): string {
  return new Date().toLocaleDateString("sv-SE");
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

export async function getTodayLog(): Promise<MoodLog | null> {
  const today = getTodayDateString();

  try {
    const log = await db.dailyLogs.where("date").equals(today).first();
    if (log) {
      return log;
    }

    const fallback = readLocalStorageLogs();
    return fallback.find((item) => item.date === today) ?? null;
  } catch {
    const all = readLocalStorageLogs();
    return all.find((log) => log.date === today) ?? null;
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
