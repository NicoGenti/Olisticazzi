---
phase: 02-oracle-response
plan: "05"
subsystem: oracle-ui
tags: [oracle, animation, navigation, framer-motion, indexeddb]

dependency_graph:
  requires: [02-01, 02-03, 02-04]
  provides: [oracle-page, oracle-card-display, suggested-remedy, daily-session-oracle-flow]
  affects: [src/hooks/useDailySession.ts, src/app/oracle/page.tsx]

tech_stack:
  added: []
  patterns:
    - "3D CSS flip using Framer Motion rotateY + preserve-3d + backfaceVisibility"
    - "IndexedDB read-on-mount for stateless oracle page (no router state)"
    - "Non-fatal oracle error handling — navigation still proceeds on oracle failure"

key_files:
  created:
    - src/app/oracle/page.tsx
    - src/components/oracle/OracleCardDisplay.tsx
    - src/components/oracle/SuggestedRemedy.tsx
  modified:
    - src/hooks/useDailySession.ts

decisions:
  - "Oracle errors in saveLog() are non-fatal — always navigate to /oracle, page shows graceful empty state"
  - "Re-save the log with oracle data after initial save (two saveMoodLog calls per save cycle)"
  - "Oracle page reads today log from IndexedDB on mount — no URL state, works on refresh"

metrics:
  duration: "10 min"
  completed: "2026-04-08"
  tasks: 2
  files: 4
---

# Phase 02 Plan 05: Oracle UI & Full Journey Wiring Summary

**One-liner:** Full oracle user journey wired — mood save triggers oracle selection, 3D tarot flip reveals card, remedy fades in after flip completes.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Extend useDailySession saveLog() with oracle engine + navigation | b2d4e63 | src/hooks/useDailySession.ts |
| 2 | Oracle page + OracleCardDisplay + SuggestedRemedy components | acde70d | src/app/oracle/page.tsx, src/components/oracle/OracleCardDisplay.tsx, src/components/oracle/SuggestedRemedy.tsx |

## What Was Built

### Task 1: Extended useDailySession
- Added `useRouter` from `next/navigation` for App Router navigation
- After initial `saveMoodLog()`, computes `moonPhase` via `getMoonPhase(new Date())`
- Fetches all logs, filters to pre-today entries, computes `trend` via `calculateMoodTrend()`
- Runs `selectOracle()` to get `card` + `remedy`
- Re-saves the log with `moonPhase`, `oracleCardId`, `oracleRemedyId`
- Oracle selection errors are caught and logged but non-fatal — navigation to `/oracle` always proceeds
- Calls `router.push('/oracle')` after successful save

### Task 2: Oracle UI Components

**OracleCardDisplay.tsx:**
- 3D Y-axis flip animation: `rotateY(180) → rotateY(0)` over 1.2s with mystical easing `[0.25, 0.1, 0.25, 1.0]`
- Uses `perspective: 1200px` container, `transformStyle: preserve-3d`, and `backfaceVisibility: hidden` on each face
- Back face: dark gradient + decorative moon/star SVG pattern
- Front face: card name (Italian, `font-display`), description, tags as pills (glassmorphism)
- `onAnimationComplete` triggers `onFlipComplete` callback

**SuggestedRemedy.tsx:**
- Fades in with `opacity: 0, y: 16` → `opacity: 1, y: 0` when `isVisible` becomes true
- Italian category labels + icons: meditazione 🧘, natura 🌿, scrittura ✍️, movimento 🚶, respiro 🌬️
- Glassmorphism style matching oracle card

**oracle/page.tsx:**
- `"use client"` — reads IndexedDB on mount via `getTodayLog()`
- Three states: `loading` → spinner; `empty` → Italian message + CTA button; `ready` → full oracle reveal
- Empty state: "Non hai ancora registrato il tuo umore oggi." with "Torna alla Home" button (no auto-redirect per spec)
- Ready state: moon phase label (Italian), OracleCardDisplay, SuggestedRemedy (hidden until flip)
- `isRemedyVisible` state set to `true` in `onFlipComplete` callback
- Italian moon phase labels (Luna Nuova, Luna Crescente, etc.) via `MOON_PHASE_IT` map
- AnimatePresence for loading → content transitions
- Subtle "← Torna alla Home" text link at bottom

## Verification

- `pnpm typecheck` — ✅ zero errors
- `pnpm build` — ✅ production build successful
  - `/` → 29.9 kB (219 kB First Load)
  - `/oracle` → 7.88 kB (197 kB First Load)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data sources are wired. Oracle page reads real IndexedDB data, components receive real card/remedy props.

## Self-Check: PASSED

- `src/app/oracle/page.tsx` — ✅ FOUND
- `src/components/oracle/OracleCardDisplay.tsx` — ✅ FOUND
- `src/components/oracle/SuggestedRemedy.tsx` — ✅ FOUND
- Commit `b2d4e63` — ✅ FOUND
- Commit `acde70d` — ✅ FOUND
