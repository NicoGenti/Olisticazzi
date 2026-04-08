---
phase: 02-oracle-response
plan: 03
subsystem: services/astrology
tags: [tdd, lunar-phase, mood-trend, astronomia, pure-ts, react-hook]
dependency_graph:
  requires: [02-01]
  provides: [getMoonPhase, calculateMoodTrend, useMoonPhase]
  affects: [02-04, 02-05]
tech_stack:
  added: [src/types/astronomia.d.ts]
  patterns: [TDD red-green, pure TS services, bracket-notation reserved-word access]
key_files:
  created:
    - src/services/moonPhase.ts
    - src/services/moonPhase.test.ts
    - src/services/moodTrend.ts
    - src/services/moodTrend.test.ts
    - src/hooks/useMoonPhase.ts
    - src/types/astronomia.d.ts
  modified: []
decisions:
  - "astronomia moonphase.new() takes decimal year (not lunation index k) — plan's implementation block had wrong API usage"
  - "Add src/types/astronomia.d.ts ambient declaration to resolve TS7016 since no @types/astronomia exists"
  - "Use (moonphase as any)['new'] bracket notation to access reserved-word property with type safety"
metrics:
  duration: "8 min"
  completed: "2026-04-08"
  tasks: 2
  files: 6
---

# Phase 02 Plan 03: Lunar Phase and Mood Trend Services Summary

**One-liner:** TDD-implemented pure TS services — getMoonPhase via astronomia decimal-year API, calculateMoodTrend with D-11 3-day rolling average, plus useMoonPhase React hook wrapper.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | TDD — failing tests for getMoonPhase | f6eaebb | src/services/moonPhase.test.ts |
| 1 (GREEN) | Implement getMoonPhase using astronomia | 1bdc046 | src/services/moonPhase.ts |
| 2 (RED) | TDD — failing tests for calculateMoodTrend | edadc93 | src/services/moodTrend.test.ts |
| 2 (GREEN) | Implement calculateMoodTrend 3-day rolling average | e258936 | src/services/moodTrend.ts |
| 2 (HOOK) | Add useMoonPhase React hook | f546218 | src/hooks/useMoonPhase.ts |
| 2 (FIX) | Jest globals imports + astronomia type declarations | 7c7316e | moonPhase.ts, *.test.ts, astronomia.d.ts |

## Verification Results

```
pnpm test:      4 test suites, 20 tests — ALL PASSED
pnpm typecheck: zero errors
```

- `src/services/moonPhase.ts` — NO React imports ✅
- `src/services/moodTrend.ts` — NO React imports ✅
- `src/hooks/useMoonPhase.ts` — `"use client"` directive ✅
- `getMoonPhase` calls `astronomia.moonphase['new']` ✅
- `calculateMoodTrend` implements D-11 exactly ✅

## Decisions Made

### 1. astronomia API uses decimal year, not lunation index k
The plan's implementation block showed `moonphase.newMoon(k)` where `k = (year + month/12 - 2000) * 12.3685`. This uses a wrong epoch — the actual astronomia `moonphase.new()` takes a decimal year (e.g., `2026.08`), not a lunation number from J2000.0.

Verified by testing: `moonphase.new(2026.0)` correctly returns the JDE for the Jan 18 2026 new moon. Implementation uses `decimalYear = year + month/12 + day/365.25`.

### 2. astronomia.d.ts ambient declarations
`astronomia@4.2.0` ships no TypeScript types and no `@types/astronomia` package exists. Rather than relying solely on `skipLibCheck:true` (which only skips lib declaration files, not module resolution errors), added `src/types/astronomia.d.ts` with explicit types for `moonphase` and `julian`.

### 3. Reserved word bracket notation
`moonphase.new` is a reserved keyword in TypeScript. The declaration file declares it as `newMoon` for documentation, but the actual runtime access uses `(moonphase as any)['new']` with explicit cast to `(year: number) => number`. Tests confirm runtime correctness.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] astronomia API mismatch — moonphase.new() takes decimal year, not k**
- **Found during:** Task 1 (before implementing)
- **Issue:** Plan's implementation block used `moonphase.newMoon(k)` where `k = (year + month/12 - 2000) * 12.3685`. Testing showed this returns JDE values from year 321 AD (wrong epoch). The actual API is `moonphase.new(decimalYear)`.
- **Fix:** Use `moonphase.new(year + month/12 + day/365.25)` and handle future new moon by stepping back one lunar month
- **Files modified:** src/services/moonPhase.ts
- **Commit:** 1bdc046

**2. [Rule 2 - Missing] @jest/globals imports missing in new test files**
- **Found during:** Task 2 (pnpm typecheck)
- **Issue:** New test files used global `describe/it/expect` without imports. Existing `db.test.ts` uses explicit `import { describe, it, expect } from "@jest/globals"`.
- **Fix:** Added `@jest/globals` imports to both test files, matching project convention
- **Files modified:** src/services/moonPhase.test.ts, src/services/moodTrend.test.ts
- **Commit:** 7c7316e

**3. [Rule 2 - Missing] astronomia ambient type declaration**
- **Found during:** Task 2 (pnpm typecheck)
- **Issue:** `import * as astronomia from 'astronomia'` caused TS7016 since no declarations exist
- **Fix:** Created `src/types/astronomia.d.ts` with minimal types for moonphase and julian modules
- **Files modified:** src/types/astronomia.d.ts
- **Commit:** 7c7316e

## Test Coverage

**moonPhase.test.ts** (6 tests):
- Returns one of 8 valid MoonPhaseName values
- Deterministic for same date
- Returns valid phase for 2026-01-29
- Different phases for dates far apart in lunar cycle
- Pure TypeScript (structural test)
- Valid phases for 5 different dates across the year

**moodTrend.test.ts** (7 tests):
- Empty logs → "stable"
- Rising: today 6, avg 4 (delta > 1)
- Falling: today 5, avg 7 (delta > 1)
- Stable: today = avg
- Exact boundary: today = avg+1 → stable (not rising, threshold is >1 not >=1)
- Single log rising: today 7, avg 4
- Last 3 only: 5-item log list, last 3 determine result

## Known Stubs

None. All services are fully implemented and tested.

## Self-Check: PASSED

Files created:
- [x] src/services/moonPhase.ts — FOUND
- [x] src/services/moonPhase.test.ts — FOUND
- [x] src/services/moodTrend.ts — FOUND
- [x] src/services/moodTrend.test.ts — FOUND
- [x] src/hooks/useMoonPhase.ts — FOUND
- [x] src/types/astronomia.d.ts — FOUND

Commits:
- [x] f6eaebb — test(02-03): add failing tests for getMoonPhase
- [x] 1bdc046 — feat(02-03): implement getMoonPhase using astronomia
- [x] edadc93 — test(02-03): add failing tests for calculateMoodTrend
- [x] e258936 — feat(02-03): implement calculateMoodTrend 3-day rolling average
- [x] f546218 — feat(02-03): add useMoonPhase React hook
- [x] 7c7316e — fix(02-03): add jest globals imports and astronomia type declarations
