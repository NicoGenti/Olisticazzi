import { describe, it, expect } from "@jest/globals";
import { getDailySticazzi } from "./sticazziSelector";
import type { SticazziEntry } from "@/types/oracle";

const SAMPLE_STICAZZI: SticazziEntry[] = [
  { id: "stc-001", text: "Prima frase ironica" },
  { id: "stc-002", text: "Seconda frase ironica" },
  { id: "stc-003", text: "Terza frase ironica" },
];

describe("getDailySticazzi", () => {
  it("returns the same sticazzi for the same date regardless of time", () => {
    const morning = new Date(2026, 3, 11, 8, 0, 0);
    const evening = new Date(2026, 3, 11, 22, 30, 0);
    const resultMorning = getDailySticazzi(morning, SAMPLE_STICAZZI);
    const resultEvening = getDailySticazzi(evening, SAMPLE_STICAZZI);
    expect(resultMorning).toEqual(resultEvening);
  });

  it("returns different sticazzi for consecutive dates", () => {
    const day1 = new Date(2026, 3, 11);
    const day2 = new Date(2026, 3, 12);
    const result1 = getDailySticazzi(day1, SAMPLE_STICAZZI);
    const result2 = getDailySticazzi(day2, SAMPLE_STICAZZI);
    expect(result1!.id).not.toBe(result2!.id);
  });

  it("wraps around when dayOfYear exceeds array length", () => {
    const dec31 = new Date(2026, 11, 31);
    const result = getDailySticazzi(dec31, SAMPLE_STICAZZI);
    expect(result).not.toBeNull();
    expect(SAMPLE_STICAZZI).toContainEqual(result);
  });

  it("returns null for empty sticazzi array", () => {
    expect(getDailySticazzi(new Date(), [])).toBeNull();
  });

  it("returns a valid SticazziEntry with id and text", () => {
    const result = getDailySticazzi(new Date(2026, 0, 1), SAMPLE_STICAZZI);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("text");
    expect(typeof result!.text).toBe("string");
  });
});
