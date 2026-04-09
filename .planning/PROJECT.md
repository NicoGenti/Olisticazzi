# Moonmood — Spiritual Mood Tracker

## Description

Moonmood is a mobile-first Progressive Web App that helps users track their emotional state through a sensory, spiritually-inspired interface. Users log daily mood via a liquid-animated slider, receive contextual oracle card readings influenced by lunar phases, and can reflect on their emotional journey through a history archive. All data is stored locally (IndexedDB) with no backend dependency.

## Tech Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Language:** TypeScript
- **UI:** React 18, Framer Motion, CSS Modules, Glassmorphism design
- **State:** Zustand
- **Persistence:** Dexie.js (IndexedDB) with localStorage fallback
- **Astrology:** astronomia (client-side lunar phase calculation)
- **Testing:** Jest
- **Deploy:** GitHub Pages (static PWA)

## Key Decisions

| # | Decision | Context | Date |
|---|----------|---------|------|
| 1 | Local-first PWA — no backend, no login for v1 | Rapid MVP, privacy-first | Pre-dev |
| 2 | Client-side lunar phase calculation (astronomia) | No external API dependency, works offline | Pre-dev |
| 3 | Oracle content bundled statically as JSON | No network needed for oracle flow | Pre-dev |
| 4 | next.config.mjs (not .ts) | .ts unsupported in this runtime | Phase 1 |
| 5 | Branded MoodScore type with runtime guard | Enforce 0-10 validity at boundaries | Phase 1 |
| 6 | Dexie primary + localStorage fallback | IndexedDB resilience | Phase 1 |
| 7 | Framer Motion drag + motion.path d-animation | Organic blob slider interaction | Phase 1 |
| 8 | LiquidSlider headless (value/onValueChange) | No direct Zustand coupling | Phase 1 |
| 9 | Selector hooks for Zustand | Minimize re-renders | Phase 1 |
| 10 | skipLibCheck:true for astronomia | No bundled types or @types package | Phase 2 |
| 11 | Default oracle card: card-010 (L'Equilibrio dei Venti) | Fallback when no cards match filter | Phase 2 |
| 12 | Oracle errors non-fatal in saveLog() | Always navigate to /oracle with graceful empty state | Phase 2 |
| 13 | History detail via /history?date=YYYY-MM-DD | Preserve static export compatibility | Phase 3 |
| 14 | History list/detail consume resolver/view-model | Keep rendering logic deterministic | Phase 3 |

## Versioning

- **v1 (current):** PWA frontend-only, local persistence, bundled content, Phases 1-5
- **v2 (planned):** .NET 8 backend, MongoDB, OAuth, cloud sync, AI integration, Phases 6-8

## Links

- **Repository:** (GitHub — Moonmood)
- **Deploy:** GitHub Pages
