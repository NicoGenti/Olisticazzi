# Roadmap: Moonmood — Spiritual Mood Tracker

## Overview

Moonmood v1 è una **Progressive Web App puramente frontend**: nessun backend, nessun database server, nessuna autenticazione. Tutti i dati sono persistiti localmente (IndexedDB) e i contenuti oracolari sono bundled nell'app come JSON statico. Le fasi lunari vengono calcolate lato client.

L'interfaccia è progettata **mobile-first** con touch targets e layout responsive che anticipano il porting futuro su React Native (iOS/Android). I componenti UI sono separati dalla logica di dominio per rendere la migrazione verso React Native il più lineare possibile.

**Versioni future:**
- **v2**: Introduzione di backend (.NET 8), database (MongoDB), autenticazione utente e sync cloud
- **v3**: App nativa iOS/Android (React Native + Expo) che condivide la logica di dominio con la web app

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Mood Input** - User can log daily mood with Moonmood UI and liquid slider (completed 2026-04-07)
- [x] **Phase 2: Oracle Response** - App delivers a meaningful oracle card and remedy based on mood and lunar phase (completed 2026-04-08)
- [x] **Phase 3: Mood History** - User can review past logs and oracle responses (completed 2026-04-08)
- [ ] **Phase 4: PWA Shell** - App is installable and works fully offline

## Phase Details

### Phase 1: Mood Input
**Goal**: Users can log their daily mood through a sensory, beautiful interface and the log is persisted locally in IndexedDB (no backend required)
**Depends on**: Nothing (first phase)
**Requirements**: MOOD-01, MOOD-02, MOOD-03, MOOD-04, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. User can drag a liquid-animated slider from 0 to 10 to set their mood score
  2. User can optionally type a text note before submitting the log
  3. Reopening the app on the same day shows today's existing log, not a blank form
  4. The Moonmood boreale gradient theme (green, violet, blue, pink) is visible throughout the app
  5. All mood logs survive a full browser refresh (persisted in IndexedDB)
  6. Layout is responsive and usable on mobile screen sizes (≥320px width), with touch targets ≥ 44px
**Plans**: 7 plans

Plans:
- [x] 01-01-PLAN.md — Bootstrap Next.js 14 project with all Phase 1 dependencies
- [x] 01-02-PLAN.md — MoodLog types and Dexie.js persistence service with tests
- [x] 01-03-PLAN.md — Zustand mood store and Aurora Boreale animated gradient overlay
- [x] 01-04-PLAN.md — LiquidSlider SVG morphing blob drag component
- [x] 01-05-PLAN.md — MoodNoteInput, SaveMoodButton, and useDailySession hook
- [x] 01-06-PLAN.md — Wire all components into page.tsx/layout.tsx + human verification

### Phase 2: Oracle Response
**Goal**: After submitting a mood log, the user receives a contextually meaningful oracle card and remedy selected by the weighted engine using lunar phase data — all computed client-side with bundled static data
**Depends on**: Phase 1
**Requirements**: ORCL-01, ORCL-02, ORCL-03, ORCL-04, ORCL-05, ASTR-01, ASTR-02, ASTR-03
**Success Criteria** (what must be TRUE):
  1. Submitting a mood log triggers an oracle card reveal with an animated, immersive transition
  2. A remedy suggestion appears alongside the oracle card
  3. The current lunar phase is calculated client-side and shown or logged (no external API call)
  4. Different mood scores and lunar phases produce meaningfully different card selections over repeated use
  5. Oracle content (cards and remedies) loads from bundled static JSON — app works with no network
**Plans**: 6 plans

Plans:
- [x] 02-01-PLAN.md — Install astronomia + define oracle/astrology/mood types + Dexie v2
- [x] 02-02-PLAN.md — Author oracle seed data (22 cards + remedies + aphorisms in Italian)
- [x] 02-03-PLAN.md — TDD: lunar phase service (astronomia) + mood trend service
- [x] 02-04-PLAN.md — TDD: oracle selection engine + useOracleEngine hook
- [x] 02-05-PLAN.md — Wire oracle into useDailySession + /oracle page + flip animation
- [x] 02-06-PLAN.md — Human verification of complete Phase 2 oracle experience
- [x] 02-07-PLAN.md — Close verification gap by defining ORCL/ASTR requirements in REQUIREMENTS.md

### Phase 3: Mood History
**Goal**: Users can reflect on their emotional journey by browsing past logs and their oracle responses, all sourced from local IndexedDB
**Depends on**: Phase 2
**Requirements**: HIST-01, HIST-02
**Success Criteria** (what must be TRUE):
  1. User can navigate to a history view listing all past logs with date, score, and oracle card name
  2. Tapping a past log opens a detail view showing the text note, oracle card, remedy, and lunar phase captured at submission time
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Define history contracts + grouped paging transformer + upgraded useMoodHistory hook
- [x] 03-02-PLAN.md — Build /history card-row month-grouped list UI, load-more, empty-state, and navigation entry points
- [x] 03-03-PLAN.md — Implement route-based history detail experience with graceful fallback and human verification

### Phase 4: PWA Shell
**Goal**: The app is installable on any device (desktop and mobile) and works completely offline after first load
**Depends on**: Phase 3
**Requirements**: UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. A browser install prompt appears (or an install button) allowing the user to add Moonmood to their home screen on both desktop and mobile
  2. After installation, the app loads and all features work with the device in airplane mode
  3. A service worker caches the app shell so reload works offline
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Mood Input | 6/6 | Complete   | 2026-04-07 |
| 2. Oracle Response | 7/7 | Complete    | 2026-04-08 |
| 3. Mood History | 3/3 | Complete | 2026-04-08 |
| 4. PWA Shell | 0/? | Not started | - |
