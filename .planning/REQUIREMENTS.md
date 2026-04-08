# Requirements

This file defines all requirement IDs referenced in phase plans and the ROADMAP.
Each entry provides an authoritative requirement statement and acceptance criteria.

---

## Phase 1: Mood Input

### MOOD-01 — Liquid Slider (0–10 drag-only input)

**Statement:** The user shall be able to set their mood score via a drag-only liquid-animated blob slider that maps the drag position to an integer value from 0 to 10 inclusive.

**Acceptance criteria:**
- The slider blob is draggable horizontally and maps position to a value in [0, 10]
- No tap-to-set, no numeric labels, no tick marks — drag is the only interaction
- The slider defaults to 5 (center) on a fresh daily log
- The blob morphs and animates reactively as the user drags

---

### MOOD-02 — Optional Text Note (up to 280 characters)

**Statement:** The user shall be able to optionally attach a text note to their mood log entry, up to 280 characters, before saving.

**Acceptance criteria:**
- The note field is presented collapsed (pill/button); tapping expands it into a textarea
- A character counter is visible when approaching the limit (≥ 240 characters)
- Saving with an empty note omits the note field from the persisted log
- Placeholder and labels are in Italian (e.g., "Come ti senti adesso?")

---

### MOOD-03 — Same-Day Read-Only Behavior

**Statement:** When the user reopens the app on a day that already has a saved mood log, the app shall display a read-only summary of that log instead of a blank input form.

**Acceptance criteria:**
- On mount, the app queries IndexedDB for today's log (local device timezone)
- If a log exists, the UI renders a read-only view with the saved score and note
- An explicit "Edit" (or equivalent Italian) button allows re-entering editing mode to overwrite
- A warm Italian message is shown alongside the saved data (e.g., "Hai già registrato il tuo umore oggi.")

---

### MOOD-04 — Persistence Across Refresh (IndexedDB with localStorage fallback)

**Statement:** All saved mood logs shall survive a full browser page reload, persisted to IndexedDB via Dexie.js with a localStorage fallback if IndexedDB is unavailable.

**Acceptance criteria:**
- `saveMoodLog()` writes the log to the Dexie `dailyLogs` table
- `getTodayLog()` reads and returns today's log from IndexedDB on subsequent loads
- If IndexedDB is unavailable, the service falls back to localStorage transparently
- A hard browser refresh restores the saved state without data loss

---

## Phase 1: UI

### UI-01 — Aurora Boreale Animated Gradient Theme

**Statement:** The app shall display a live-reactive Aurora Boreale animated gradient background that shifts its color palette in real time based on the current mood score.

**Acceptance criteria:**
- The background gradient is always animating (ambient motion at rest, reactive on drag)
- Low mood (0–3): misty grey-blue / cool desaturated palette
- Mid mood (4–7): smooth interpolation across the Aurora palette
- High mood (8–10): full vivid Aurora Boreale colors (green, violet, blue, pink)
- The overlay renders full-viewport and is wired to the global mood score Zustand store

---

### UI-02 — Mobile-First Responsive Layout with Accessible Touch Targets

**Statement:** The app layout shall be usable on mobile screen widths from 320px and all interactive controls shall meet minimum touch target size requirements.

**Acceptance criteria:**
- Layout uses single-column mobile-first structure with no horizontal overflow at ≥ 320px width
- All interactive touch targets (slider, note pill, save button) are ≥ 44px in height or diameter
- The app is visually functional and usable on a 320×568 viewport (iPhone SE 1st gen minimum)
- No fixed-width elements that overflow on small screens

---

## Phase 2: Oracle Response

### ORCL-01 — Save-to-Oracle Reveal Flow

**Statement:** After the user saves a daily mood log, the app shall navigate to `/oracle` and reveal the selected oracle card with a 3D flip animation, then reveal the remedy with a delayed fade-in.

**Acceptance criteria:**
- A successful save in the daily session flow triggers navigation to `/oracle` via App Router.
- The oracle card is initially face-down and transitions to face-up through a Y-axis 3D flip animation.
- The remedy UI remains hidden until the card flip completion callback fires.
- After the flip completion event, the remedy fades in below the card during the same oracle session.

---

### ORCL-02 — Stateless Oracle Route with Empty State CTA

**Statement:** The `/oracle` route shall be stateless and reconstruct its view from persisted local data on mount, with an explicit empty-state CTA when no mood log exists for today.

**Acceptance criteria:**
- On mount, `/oracle` reads today’s log from IndexedDB (with existing persistence fallback behavior) and does not rely on router payload/state.
- Direct navigation to `/oracle` and browser refresh both produce the same resolved state from storage.
- If no today log is found, the page shows an Italian empty-state message and a CTA that navigates back to `/`.
- The empty state does not auto-redirect; user intent is required to leave `/oracle`.

---

### ORCL-03 — Weighted Oracle Selection Rules

**Statement:** Oracle selection shall apply deterministic weighted rules over eligible cards, then introduce bounded randomness by choosing uniformly from the top-scored candidates.

**Acceptance criteria:**
- A hard filter runs first: only cards whose `moodRange` includes today’s mood score are eligible.
- For each eligible card, scoring applies +2 for moon phase match, +1 for tag relevance, and +1 for trend match.
- Eligible cards are sorted by score, top 5 are selected as the candidate pool, and one card is chosen uniformly at random from that pool.
- If no cards pass the hard filter, the engine returns the designated default card.

---

### ORCL-04 — Persist Oracle Selection in MoodLog

**Statement:** The oracle outcome used for display shall be persisted into the same daily MoodLog record as lightweight identifiers, enabling later retrieval without duplicating full card content.

**Acceptance criteria:**
- The MoodLog schema includes optional fields `oracleCardId` and `oracleRemedyId`.
- After selection, the save flow writes `oracleCardId` and `oracleRemedyId` into the persisted daily log.
- Persisted IDs correspond to valid entries in bundled oracle and remedy seed datasets.
- The `/oracle` page resolves card and remedy content by IDs from the persisted MoodLog.

---

### ORCL-05 — Bundled Static Oracle Content Integrity

**Statement:** Oracle domain content shall be bundled as static local JSON datasets (cards, remedies, aphorisms) with Italian copy and schema constraints compatible with client-only execution.

**Acceptance criteria:**
- Oracle card, remedy, and aphorism content are stored in local bundled JSON files under `src/data/`.
- Card records include: `id`, Italian `name`, Italian `description`, `moodRange`, `moonPhases`, and `tags`.
- Remedy records include: `id`, Italian `text`, `linkedCardId`, and `category`, with one remedy per card.
- The oracle path reads these datasets via static imports with no network dependency for content retrieval.

---

### ASTR-01 — Client-Side Lunar Phase Computation (8 Phases)

**Statement:** The app shall compute lunar phase client-side using `astronomia` and normalize output to exactly 8 named moon phases for oracle logic and display.

**Acceptance criteria:**
- Lunar phase computation for oracle flow is executed locally in app code using `astronomia`.
- The resulting phase value is one of exactly these 8 names: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent.
- No additional lunar metrics (illumination percentage, lunar age, zodiac position) are required to satisfy this requirement.
- Oracle selection consumes the normalized phase name in its scoring path.

---

### ASTR-02 — Save-Time Moon Phase Snapshot Persistence

**Statement:** The lunar phase used for an oracle result shall be captured at mood save time and persisted in the associated MoodLog record for deterministic replay on `/oracle`.

**Acceptance criteria:**
- When the user saves the daily mood log, moon phase is computed during the save flow (not lazily only at render).
- The MoodLog schema includes optional `moonPhase` and persists it for the saved entry.
- The `/oracle` route reads persisted `moonPhase` from today’s log to render/log the saved result context.
- Existing older logs without `moonPhase` remain valid due to optional schema fields.

---

### ASTR-03 — No External Astrology API Dependency

**Statement:** The astrology path used by oracle selection shall remain fully local and must not depend on external HTTP APIs for lunar phase data.

**Acceptance criteria:**
- No network request is required to calculate moon phase during save or oracle selection flows.
- Disabling network access does not prevent lunar phase calculation for oracle selection.
- Oracle selection and `/oracle` rendering continue to function with bundled data and local persistence only.
- Any astrology dependency used in this path is a local library/package, not a remote service contract.
