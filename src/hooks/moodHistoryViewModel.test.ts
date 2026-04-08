import { describe, expect, it } from "@jest/globals";

import { buildMoodHistoryPage } from "@/hooks/moodHistoryViewModel";
import type { MoodLog } from "@/types/mood";
import type { OracleCard } from "@/types/oracle";

function createLog(partial: Partial<MoodLog> & Pick<MoodLog, "date" | "moodScore" | "createdAt">): MoodLog {
  return {
    id: partial.id ?? `id-${partial.date}-${partial.createdAt}`,
    date: partial.date,
    moodScore: partial.moodScore,
    createdAt: partial.createdAt,
    note: partial.note,
    moonPhase: partial.moonPhase,
    oracleCardId: partial.oracleCardId,
    oracleRemedyId: partial.oracleRemedyId,
  };
}

describe("buildMoodHistoryPage", () => {
  const cardsById: Record<string, OracleCard> = {
    "card-001": {
      id: "card-001",
      name: "La Luna Velata",
      description: "desc",
      moodRange: [0, 3],
      moonPhases: ["New Moon"],
      tags: ["introspezione"],
    },
  };

  it("keeps newest-first ordering in visible slice (D-06)", () => {
    const logs: MoodLog[] = [
      createLog({ date: "2026-04-10", moodScore: 7 as MoodLog["moodScore"], createdAt: 300, oracleCardId: "card-001" }),
      createLog({ date: "2026-04-09", moodScore: 6 as MoodLog["moodScore"], createdAt: 200 }),
      createLog({ date: "2026-04-08", moodScore: 5 as MoodLog["moodScore"], createdAt: 100 }),
    ];

    const result = buildMoodHistoryPage(logs, 2, cardsById);
    const flattenedDates = result.groups.flatMap((group) => group.items.map((item) => item.date));

    expect(flattenedDates).toEqual(["2026-04-10", "2026-04-09"]);
  });

  it("groups by month with Italian month labels (D-07)", () => {
    const logs: MoodLog[] = [
      createLog({ date: "2026-04-10", moodScore: 7 as MoodLog["moodScore"], createdAt: 300 }),
      createLog({ date: "2026-03-30", moodScore: 4 as MoodLog["moodScore"], createdAt: 250 }),
      createLog({ date: "2026-03-15", moodScore: 2 as MoodLog["moodScore"], createdAt: 200 }),
    ];

    const result = buildMoodHistoryPage(logs, 3, cardsById);

    expect(result.groups).toHaveLength(2);
    expect(result.groups[0].monthKey).toBe("2026-04");
    expect(result.groups[0].monthLabelIt).toBe("aprile 2026");
    expect(result.groups[1].monthKey).toBe("2026-03");
    expect(result.groups[1].monthLabelIt).toBe("marzo 2026");
  });

  it("tracks hasMore transitions and fallback oracle preview (D-08)", () => {
    const logs: MoodLog[] = [
      createLog({ date: "2026-04-10", moodScore: 7 as MoodLog["moodScore"], createdAt: 300, oracleCardId: "card-001" }),
      createLog({ date: "2026-04-09", moodScore: 6 as MoodLog["moodScore"], createdAt: 200, oracleCardId: "unknown-card" }),
      createLog({ date: "2026-04-08", moodScore: 5 as MoodLog["moodScore"], createdAt: 100 }),
    ];

    const first = buildMoodHistoryPage(logs, 1, cardsById);
    expect(first.hasMore).toBe(true);
    expect(first.visibleCount).toBe(1);
    expect(first.totalCount).toBe(3);

    const expanded = buildMoodHistoryPage(logs, 3, cardsById);
    expect(expanded.hasMore).toBe(false);
    expect(expanded.visibleCount).toBe(3);
    expect(expanded.totalCount).toBe(3);

    const fallbackName = expanded.groups.flatMap((group) => group.items).find((item) => item.date === "2026-04-09");
    expect(fallbackName?.oracleCardName).toBe("Oracolo non disponibile");
  });
});
