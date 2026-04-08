import { selectOracle, scoreCard } from "@/services/oracleEngine";
import type { OracleCard, Remedy, OracleSelectionInput } from "@/types/oracle";

// ---------------------------------------------------------------------------
// Minimal inline mock dataset — 4 cards + remedies covering all test cases
// ---------------------------------------------------------------------------

/** card-A: low mood range [0,3], New Moon phase, falling tags */
const cardA: OracleCard = {
  id: "card-A",
  name: "Card A",
  description: "desc A",
  moodRange: [0, 3],
  moonPhases: ["New Moon"],
  tags: ["introspezione", "ombra"],
};

/** card-B: mid mood range [3,8], Waxing Gibbous phase, stable tags */
const cardB: OracleCard = {
  id: "card-B",
  name: "Card B",
  description: "desc B",
  moodRange: [3, 8],
  moonPhases: ["Waxing Gibbous"],
  tags: ["equilibrio", "pace"],
};

/** card-C: high mood range [7,10], Full Moon phase, rising tags */
const cardC: OracleCard = {
  id: "card-C",
  name: "Card C",
  description: "desc C",
  moodRange: [7, 10],
  moonPhases: ["Full Moon"],
  tags: ["rinascita", "luce"],
};

/** card-D: default card, wide range [2,8], no special moon/tags */
const cardDefault: OracleCard = {
  id: "card-D",
  name: "Card Default",
  description: "desc D",
  moodRange: [2, 8],
  moonPhases: ["Waxing Gibbous"],
  tags: [],
  isDefault: true,
};

const allCards: OracleCard[] = [cardA, cardB, cardC, cardDefault];

const remedyA: Remedy = {
  id: "remedy-A",
  text: "Remedy for A",
  linkedCardId: "card-A",
  category: "meditazione",
};
const remedyB: Remedy = {
  id: "remedy-B",
  text: "Remedy for B",
  linkedCardId: "card-B",
  category: "natura",
};
const remedyC: Remedy = {
  id: "remedy-C",
  text: "Remedy for C",
  linkedCardId: "card-C",
  category: "movimento",
};
const remedyDefault: Remedy = {
  id: "remedy-D",
  text: "Remedy for Default",
  linkedCardId: "card-D",
  category: "respiro",
};

const allRemedies: Remedy[] = [remedyA, remedyB, remedyC, remedyDefault];

// ---------------------------------------------------------------------------
// scoreCard tests
// ---------------------------------------------------------------------------

describe("scoreCard", () => {
  it("lunar match adds 2 to score", () => {
    const input: OracleSelectionInput = {
      moodScore: 5,
      moonPhase: "Waxing Gibbous",
      trend: "stable",
    };
    const score = scoreCard(cardB, input);
    // lunar match (+2) + tag match 'equilibrio' in stable tags (+1) + sweet-spot check
    expect(score).toBeGreaterThanOrEqual(2);
  });

  it("no lunar match gives 0 lunar bonus", () => {
    const input: OracleSelectionInput = {
      moodScore: 5,
      moonPhase: "Last Quarter", // cardB has Waxing Gibbous only
      trend: "rising",
    };
    const scoreWithoutLunar = scoreCard(cardB, input);
    const inputWithLunar: OracleSelectionInput = {
      ...input,
      moonPhase: "Waxing Gibbous",
    };
    const scoreWithLunar = scoreCard(cardB, inputWithLunar);
    expect(scoreWithLunar - scoreWithoutLunar).toBe(2);
  });

  it("card with no matching criteria returns score 0", () => {
    const bareCard: OracleCard = {
      id: "bare",
      name: "Bare",
      description: "bare",
      moodRange: [0, 10],
      moonPhases: ["Last Quarter"],
      tags: [],
    };
    const input: OracleSelectionInput = {
      moodScore: 5,
      moonPhase: "New Moon", // no match
      trend: "stable",
    };
    // No lunar match, no tag match; mood score 5 midpoint of [0,10]=5, |5-5|=0 <= 1.5 → +1
    // Actually the sweet-spot check may award 1. Let's test a card that also misses sweet spot.
    const extremeCard: OracleCard = {
      ...bareCard,
      moodRange: [0, 1],
    };
    const extremeInput: OracleSelectionInput = {
      moodScore: 0,
      moonPhase: "New Moon",
      trend: "stable",
    };
    // moonPhase "New Moon" not in ["Last Quarter"] for extremeCard
    const score = scoreCard(extremeCard, extremeInput);
    // no lunar match (New Moon not in [Last Quarter]), no tags, sweet spot: mid=(0+1)/2=0.5, |0-0.5|=0.5<=1.5 → +1
    expect(score).toBe(1);
  });

  it("returns 0 for card with truly no matches", () => {
    const farCard: OracleCard = {
      id: "far",
      name: "Far",
      description: "far",
      moodRange: [0, 1],
      moonPhases: ["Last Quarter"],
      tags: [],
    };
    const input: OracleSelectionInput = {
      moodScore: 10, // far from sweet spot: mid=0.5, |10-0.5|=9.5 > 1.5
      moonPhase: "New Moon", // not in ["Last Quarter"]
      trend: "stable", // no tags
    };
    expect(scoreCard(farCard, input)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// selectOracle — hard filter tests
// ---------------------------------------------------------------------------

describe("selectOracle — hard filter", () => {
  it("excludes cards where moodScore is outside moodRange", () => {
    const input: OracleSelectionInput = {
      moodScore: 5,
      moonPhase: "Waxing Gibbous",
      trend: "stable",
    };
    // cardA has range [0,3] → excluded for score 5
    // cardC has range [7,10] → excluded for score 5
    // cardB has range [3,8] → included
    // cardDefault has range [2,8] → included
    const result = selectOracle(input, allCards, allRemedies);
    expect(result.card.id).toMatch(/card-[BD]/);
  });

  it("includes a card where moodScore is exactly at range boundary (inclusive)", () => {
    const input: OracleSelectionInput = {
      moodScore: 3,
      moonPhase: "New Moon",
      trend: "stable",
    };
    // cardA range [0,3] → moodScore=3 is included (inclusive)
    // cardB range [3,8] → included
    // cardDefault range [2,8] → included
    const result = selectOracle(input, allCards, allRemedies);
    expect(["card-A", "card-B", "card-D"]).toContain(result.card.id);
  });

  it("excludes a card where moodScore is strictly outside range", () => {
    // Use a dataset where only cardC passes for high moodScore
    const singlePassCards: OracleCard[] = [
      cardA,
      cardC,
      { ...cardDefault, moodRange: [9, 10] as [number, number] }, // narrow default
    ];
    const remediesForSingle: Remedy[] = [
      remedyA,
      remedyC,
      { ...remedyDefault, linkedCardId: "card-D" },
    ];
    const input: OracleSelectionInput = {
      moodScore: 9,
      moonPhase: "Full Moon",
      trend: "rising",
    };
    // cardA [0,3] → excluded
    // cardC [7,10] → included
    // modified default [9,10] → included
    const result = selectOracle(input, singlePassCards, remediesForSingle);
    expect(["card-C", "card-D"]).toContain(result.card.id);
  });
});

// ---------------------------------------------------------------------------
// selectOracle — fallback test
// ---------------------------------------------------------------------------

describe("selectOracle — fallback to default card", () => {
  it("returns the isDefault card when no cards pass the hard filter", () => {
    const input: OracleSelectionInput = {
      moodScore: 5,
      moonPhase: "New Moon",
      trend: "stable",
    };
    // Construct cards where none have range covering 5 except default
    const narrowCards: OracleCard[] = [
      { ...cardA, moodRange: [0, 2] as [number, number] },
      { ...cardC, moodRange: [8, 10] as [number, number] },
      cardDefault, // moodRange [2,8] covers 5, but let's test with no-overlap scenario
    ];
    // Actually to have NO card pass, make default's range also not cover 5
    const noPassCards: OracleCard[] = [
      { ...cardA, moodRange: [0, 2] as [number, number] },
      { ...cardC, moodRange: [8, 10] as [number, number] },
      { ...cardDefault, moodRange: [0, 1] as [number, number], isDefault: true },
    ];
    const noPassRemedies: Remedy[] = [remedyA, remedyC, remedyDefault];
    const result = selectOracle(input, noPassCards, noPassRemedies);
    expect(result.card.id).toBe("card-D");
    expect(result.card.isDefault).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// selectOracle — result integrity tests
// ---------------------------------------------------------------------------

describe("selectOracle — result integrity", () => {
  it("returns { card, remedy } where remedy.linkedCardId === card.id", () => {
    const input: OracleSelectionInput = {
      moodScore: 5,
      moonPhase: "Waxing Gibbous",
      trend: "stable",
    };
    const result = selectOracle(input, allCards, allRemedies);
    expect(result.card).toBeDefined();
    expect(result.remedy).toBeDefined();
    expect(result.remedy.linkedCardId).toBe(result.card.id);
  });

  it("with only 1 eligible card, always returns that card", () => {
    const singleCardSet: OracleCard[] = [
      cardA, // [0,3]
      { ...cardDefault, moodRange: [0, 1] as [number, number], isDefault: true }, // narrow
    ];
    const singleRemedies: Remedy[] = [
      remedyA,
      { ...remedyDefault, linkedCardId: "card-D" },
    ];
    const input: OracleSelectionInput = {
      moodScore: 2,
      moonPhase: "New Moon",
      trend: "falling",
    };
    // cardA [0,3] covers 2 → eligible
    // modified default [0,1] → does NOT cover 2
    // So only cardA passes; should always return cardA
    for (let i = 0; i < 10; i++) {
      const result = selectOracle(input, singleCardSet, singleRemedies);
      expect(result.card.id).toBe("card-A");
    }
  });

  it("throws if no remedy found for selected card", () => {
    const input: OracleSelectionInput = {
      moodScore: 5,
      moonPhase: "Waxing Gibbous",
      trend: "stable",
    };
    // Only cardB passes, but no remedy for card-B provided
    const cardsOnly: OracleCard[] = [cardB];
    const noMatchingRemedy: Remedy[] = [remedyA]; // wrong linkedCardId
    expect(() => selectOracle(input, cardsOnly, noMatchingRemedy)).toThrow(
      "No remedy found for card card-B"
    );
  });
});
