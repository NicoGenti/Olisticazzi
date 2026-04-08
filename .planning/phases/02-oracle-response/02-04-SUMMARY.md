---
phase: 02-oracle-response
plan: "04"
subsystem: oracle-engine
tags: [oracle, tdd, pure-function, react-hook, selection-algorithm]
dependency_graph:
  requires: [02-01, 02-02, 02-03]
  provides: [oracle-selection-engine, use-oracle-engine-hook]
  affects: [02-05-useDailySession, oracle-result-display]
tech_stack:
  added: []
  patterns: [pure-function, tdd-red-green, useMemo-hook, json-seed-data]
key_files:
  created:
    - src/services/oracleEngine.ts
    - src/services/oracleEngine.test.ts
    - src/hooks/useOracleEngine.ts
  modified: []
decisions:
  - "@jest/globals explicit imports required in test files for pnpm typecheck compliance (existing pattern from moodTrend.test.ts)"
metrics:
  duration: "4 min"
  completed: "2026-04-08"
  tasks: 2
  files: 3
requirements: [ORCL-01, ORCL-02, ORCL-03, ORCL-04]
---

# Phase 02 Plan 04: Oracle Selection Engine Summary

**One-liner:** Pure `selectOracle` function with TDD coverage implementing D-12/D-13/D-14 rules, wrapped in `useOracleEngine` React hook that wires seed data, lunar phase, and mood trend.

## What Was Built

### `src/services/oracleEngine.ts`
Pure TypeScript oracle selection engine with two exports:

- **`scoreCard(card, input): number`** — Scores a card against the selection input:
  - `+2` lunar phase match (D-12)
  - `+1` any card tag in trend keyword list (D-12)
  - `+1` mood score within ±1.5 of card range midpoint ("sweet spot")
- **`selectOracle(input, cards, remedies): OracleSelectionResult`** — Full selection algorithm:
  - Hard filter: `moodRange[0] <= moodScore <= moodRange[1]` (D-13)
  - Fallback to `isDefault: true` card when no cards pass (D-14)
  - Score all cards in pool, sort descending, take top 5
  - Uniform random pick from top-5
  - Find linked remedy, return `{ card, remedy }`
  - Throws descriptive error if remedy is missing (seed data integrity guard)

Zero React imports — portable to React Native.

### `src/services/oracleEngine.test.ts`
11 tests covering all D-12/D-13/D-14 behaviors:
- Hard filter exclusion/inclusion at range boundaries (inclusive)
- Fallback to default card when no cards pass hard filter
- `scoreCard` lunar bonus (+2) verified with and without match
- `scoreCard` returns 0 for a card with truly no matching criteria
- Result integrity: `remedy.linkedCardId === card.id`
- Single eligible card always returns that card (10 iterations)
- Error thrown on missing remedy

### `src/hooks/useOracleEngine.ts`
React hook wiring all oracle engine dependencies:
- Loads `oracle_seed.json` and `remedies_seed.json` from static data
- Calls `getMoonPhase(new Date())` for live lunar context
- Calls `calculateMoodTrend(recentLogs, moodScore)` for trend
- Calls `selectOracle()` with all three inputs
- `useMemo`-wrapped: re-runs only when `moodScore` or `recentLogs` change
- `"use client"` directive for Next.js App Router compatibility

## Verification Results

```
pnpm test
  Test Suites: 5 passed, 5 total
  Tests:       31 passed, 31 total

pnpm typecheck
  → zero errors
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `@jest/globals` imports in test file**
- **Found during:** Task 2 (typecheck step)
- **Issue:** Test file used global `describe`, `it`, `expect` without importing from `@jest/globals`, causing TypeScript errors. Project convention (established in `moodTrend.test.ts`, `moonPhase.test.ts`) requires explicit imports.
- **Fix:** Added `import { describe, expect, it } from "@jest/globals"` at top of `oracleEngine.test.ts`
- **Files modified:** `src/services/oracleEngine.test.ts`
- **Commit:** 078a954

## Known Stubs

None — `selectOracle` is fully wired with real seed data. No placeholder returns.

## Self-Check: PASSED

- `src/services/oracleEngine.ts` — exists ✓
- `src/services/oracleEngine.test.ts` — exists ✓
- `src/hooks/useOracleEngine.ts` — exists ✓
- No React imports in oracleEngine.ts ✓
- `"use client"` in useOracleEngine.ts ✓
- Commits: aa985d3 (test RED), 8c50acf (feat GREEN), 078a954 (hook + fix) ✓
