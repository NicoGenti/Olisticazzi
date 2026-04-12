import "fake-indexeddb/auto";
import { renderHook, act } from "@testing-library/react";
import { describe, beforeEach, expect, it } from "@jest/globals";

if (typeof global.structuredClone === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).structuredClone = <T>(obj: T): T =>
    JSON.parse(JSON.stringify(obj));
}

import { db } from "@/services/db";
import { useFavorite } from "./useFavorite";

beforeEach(async () => {
  await db.favorites.clear();
});

describe("useFavorite", () => {
  it("initializes as not favorited when no favorite exists", async () => {
    const { result } = renderHook(() => useFavorite("oracle", "card-001"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.favorited).toBe(false);
  });

  it("initializes as favorited when favorite exists", async () => {
    await db.favorites.add({
      id: "test-id",
      type: "oracle",
      contentId: "card-001",
      savedAt: Date.now(),
    });
    const { result } = renderHook(() => useFavorite("oracle", "card-001"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.favorited).toBe(true);
  });

  it("toggles from not favorited to favorited", async () => {
    const { result } = renderHook(() => useFavorite("oracle", "card-001"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.favorited).toBe(false);

    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.favorited).toBe(true);

    const all = await db.favorites.toArray();
    expect(all.length).toBe(1);
    expect(all[0].type).toBe("oracle");
    expect(all[0].contentId).toBe("card-001");
  });

  it("toggles from favorited to not favorited", async () => {
    await db.favorites.add({
      id: "test-id",
      type: "aphorism",
      contentId: "aph-001",
      savedAt: Date.now(),
    });
    const { result } = renderHook(() => useFavorite("aphorism", "aph-001"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.favorited).toBe(true);

    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.favorited).toBe(false);

    const all = await db.favorites.toArray();
    expect(all.length).toBe(0);
  });

  it("sets animating to true during toggle and false after", async () => {
    const { result } = renderHook(() => useFavorite("sticazzi", "stc-001"));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.animating).toBe(false);

    await act(async () => {
      await result.current.toggle();
      await new Promise((r) => setTimeout(r, 350));
    });
    expect(result.current.animating).toBe(false);
  });
});
