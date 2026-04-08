# Moonmood

App mobile-first per il tracciamento dell'umore con engine oracolare basato su fase lunare e weighted random selection.

## Overview

Moonmood è una **Progressive Web App (PWA) offline-first** che permette all'utente di registrare il proprio stato d'umore giornaliero (0–10) e ricevere una carta oracolare personalizzata in base al mood, alla fase lunare corrente e al trend degli ultimi giorni.

Nessun backend, nessun account, nessun dato inviato a server. Tutto gira nel browser.

## Tech Stack

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | TailwindCSS + Framer Motion |
| State | Zustand |
| Persistenza | Dexie.js (IndexedDB) |
| Validazione | Zod |
| Audio | Howler.js |
| Language | TypeScript (strict) |
| Package manager | pnpm |

## Architettura

```
Browser only — zero backend
┌─────────────────────────────────┐
│  Presentation (Next.js + Framer)│
├─────────────────────────────────┤
│  State Management (Zustand)     │
├─────────────────────────────────┤
│  Domain Logic (Oracle Engine)   │  ← funzioni pure, portable in React Native
├─────────────────────────────────┤
│  Data Layer (Dexie / IndexedDB) │
├─────────────────────────────────┤
│  Static Content (JSON bundled)  │
└─────────────────────────────────┘
```

**Flusso principale:**

1. L'utente muove il `LiquidSlider` (0–10) → Zustand aggiorna il mood in tempo reale
2. Gradienti aurora boreale e audio ambient reagiscono al cambio di mood
3. L'utente aggiunge una nota opzionale e salva
4. L'Oracle Engine calcola la fase lunare client-side, filtra le carte bundled e seleziona con weighted randomness dalla top 5
5. Il `DailyLog` completo viene persistito in IndexedDB
6. La carta oracolare appare con animazione glassmorphism + breath animation

## Struttura del Progetto

```
src/
├── app/                    # Next.js App Router (dashboard, /oracle, /history)
├── components/             # UI components (mood/, oracle/, history/, layout/)
├── hooks/                  # Custom React hooks (useMoodStore, useOracleEngine, …)
├── services/               # Domain logic framework-agnostic (oracleEngine, moonPhase, db)
├── data/                   # Contenuti oracolari bundled (oracle_seed.json, remedies_seed.json, …)
├── types/                  # TypeScript types (mood, oracle, astrology)
└── lib/                    # Wrappers terze parti (audio)
```

## Getting Started

```bash
pnpm install
pnpm dev
```

L'app sarà disponibile su `http://localhost:3000`.

## Documentazione

La documentazione di architettura e design si trova in `/docs`:

- `SAD.md` — Software Architecture Document
- `PRD.md` — Product Requirements Document
- `ERD.md` — Entity Relationship Diagram
- `CoreEngineLogic.md` — Algoritmo Oracle Engine (pseudo-code)
- `ModuliOracolari.md` — Definizione moduli oracolari e trigger rules
- `DesignSystemComponentTree.md` — Gerarchia componenti UI
- `OpenAPI-SwaggerSpec.md` — Specifiche API (v2+)

## Roadmap

- **v1** — PWA offline-first (in sviluppo): mood tracking, oracle engine, mood history
- **v2** — Backend opzionale: account utente, sync remota, MongoDB, API REST

## Convenzioni

- Commit: [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`)
- Branch: `feature/`, `bugfix/`, `chore/`
- Componenti: PascalCase — Hook: `use` prefix — Servizi: camelCase
