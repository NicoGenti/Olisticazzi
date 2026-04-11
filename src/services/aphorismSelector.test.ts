import { describe, it, expect } from "@jest/globals";
import { getDayOfYear, getDailyAphorism } from "./aphorismSelector";
import type { AphorismEntry } from "@/types/oracle";

const SAMPLE_APHORISMS: AphorismEntry[] = [
  { id: "aph-001", text: "Primo aforisma" },
  { id: "aph-002", text: "Secondo aforisma" },
  { id: "aph-003", text: "Terzo aforisma" },
];

describe("getDayOfYear", () => {
  it("returns 1 for January 1st", () => {
    expect(getDayOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  it("returns 32 for February 1st", () => {
    expect(getDayOfYear(new Date(2026, 1, 1))).toBe(32);
  });

  it("returns 365 for December 31st in non-leap year", () => {
    expect(getDayOfYear(new Date(2026, 11, 31))).toBe(365);
  });

  it("returns 366 for December 31st in leap year", () => {
    expect(getDayOfYear(new Date(2024, 11, 31))).toBe(366);
  });
});

describe("getDailyAphorism", () => {
  it("returns the same aphorism for the same date regardless of time", () => {
    const morning = new Date(2026, 3, 11, 8, 0, 0);
    const evening = new Date(2026, 3, 11, 22, 30, 0);
    const resultMorning = getDailyAphorism(morning, SAMPLE_APHORISMS);
    const resultEvening = getDailyAphorism(evening, SAMPLE_APHORISMS);
    expect(resultMorning).toEqual(resultEvening);
  });

  it("returns different aphorisms for consecutive dates", () => {
    const day1 = new Date(2026, 3, 11);
    const day2 = new Date(2026, 3, 12);
    const result1 = getDailyAphorism(day1, SAMPLE_APHORISMS);
    const result2 = getDailyAphorism(day2, SAMPLE_APHORISMS);
    expect(result1!.id).not.toBe(result2!.id);
  });

  it("wraps around when dayOfYear exceeds array length", () => {
    const dec31 = new Date(2026, 11, 31);
    const result = getDailyAphorism(dec31, SAMPLE_APHORISMS);
    expect(result).not.toBeNull();
    expect(SAMPLE_APHORISMS).toContainEqual(result);
  });

  it("returns null for empty aphorisms array", () => {
    expect(getDailyAphorism(new Date(), [])).toBeNull();
  });

  it("returns a valid AphorismEntry with id and text", () => {
    const result = getDailyAphorism(new Date(2026, 0, 1), SAMPLE_APHORISMS);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("text");
    expect(typeof result!.text).toBe("string");
  });
});
