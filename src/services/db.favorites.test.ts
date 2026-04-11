import "fake-indexeddb/auto";
import { describe, beforeEach, expect, it } from "@jest/globals";

if (typeof global.structuredClone === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).structuredClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
}

import { db, addFavorite, removeFavorite, isFavorite, getAllFavorites, clearAllLocalData } from "./db";

beforeEach(async () => {
  await db.dailyLogs.clear();
  await db.favorites.clear();
  localStorage.removeItem("moonmood_logs");
});

describe("addFavorite", () => {
  it("adds a favorite entry and returns it", async () => {
    const entry = await addFavorite("oracle", "card-001");
    expect(entry).toMatchObject({
      id: expect.any(String),
      type: "oracle",
      contentId: "card-001",
      savedAt: expect.any(Number),
    });
  });

  it("can add favorites of different types", async () => {
    const f1 = await addFavorite("oracle", "card-001");
    const f2 = await addFavorite("aphorism", "aph-001");
    const f3 = await addFavorite("sticazzi", "stc-001");
    expect(f1.type).toBe("oracle");
    expect(f2.type).toBe("aphorism");
    expect(f3.type).toBe("sticazzi");
  });
});

describe("removeFavorite", () => {
  it("removes a favorite by type and contentId", async () => {
    await addFavorite("oracle", "card-001");
    await addFavorite("oracle", "card-002");
    await removeFavorite("oracle", "card-001");
    const all = await getAllFavorites();
    expect(all.find((f) => f.contentId === "card-001")).toBeUndefined();
    expect(all.find((f) => f.contentId === "card-002")).toBeDefined();
  });
});

describe("isFavorite", () => {
  it("returns true when favorite exists", async () => {
    await addFavorite("oracle", "card-001");
    const result = await isFavorite("oracle", "card-001");
    expect(result).toBe(true);
  });

  it("returns false when favorite does not exist", async () => {
    const result = await isFavorite("oracle", "nonexistent");
    expect(result).toBe(false);
  });
});

describe("getAllFavorites", () => {
  it("returns favorites sorted by savedAt descending", async () => {
    await addFavorite("oracle", "card-001");
    await new Promise((r) => setTimeout(r, 10));
    await addFavorite("oracle", "card-002");
    const all = await getAllFavorites();
    expect(all[0].contentId).toBe("card-002");
    expect(all[1].contentId).toBe("card-001");
  });

  it("returns empty array when no favorites", async () => {
    const all = await getAllFavorites();
    expect(all).toEqual([]);
  });
});

describe("clearAllLocalData", () => {
  it("clears both dailyLogs and favorites tables", async () => {
    await addFavorite("oracle", "card-001");
    await clearAllLocalData();
    const all = await getAllFavorites();
    expect(all).toEqual([]);
    const logs = await db.dailyLogs.toArray();
    expect(logs).toEqual([]);
  });
});
