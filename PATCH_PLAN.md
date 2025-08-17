# PATCH_PLAN — Depthbound Big-Patch Roadmap v1
Date: 2025-08-17

This document enumerates **exact contents** for each big, flag-guarded patch. Each patch ships as a **ZIP with changed/new files only**, plus `VERSION.json`, `PATCH_NOTES.md`, `INSTALL.md`, and `SMOKE_TEST.md`. **No green CI, no ZIP.**

---

## Patch 0 — Pre‑flight “Contract v1” (tests + CI only)
**Goal:** Lock safety net for rapid development.

### Scope
- **Playwright UI tests**: inventory open/close; vendor open/buy/sell; bump‑to‑duel → combat UI; attack→enemy→flee; victory cleanup (enemy removed immediately, tile walkable, loot appears immediately and persists); ESC latch correctness; modal containment with **no horizontal scroll** at 960/1200/1440.
- **JSON Schemas** for current `data/items.json` (sv=2) and any active data.
- **CI workflow** in `.github/workflows/smoke.yml`: npm+Playwright caching, Chromium only, concurrency (cancel in‑progress).

### Files
- `tests/**` (UI specs + helpers)
- `.github/workflows/smoke.yml`
- `data/schemas/items.v2.schema.json` (if missing)
- Docs: `VERSION.json`, `PATCH_NOTES.md`, `INSTALL.md`, `SMOKE_TEST.md`

### Acceptance
- All tests green; **no console errors**; no horizontal scroll; cache restored in CI.

---

## Patch 1 — Stats & Slots + Mutations v1 (flagged, large)
**Goal:** Big stat system, **22 equipment slots**, **8 mutation slots**, Character Sheet UI.

### Data
- `data/stats.json` (core/derived/channels/survival hooks, caps, visibility)
- `data/schemas/stats.schema.json`
- `data/schemas/items.v3.schema.json` (adds `equip`, `mods`, `channels`, `reqs`)
- `scripts/migrate_items_v2_to_v3.js` + `MIGRATION_NOTES.md`
- `data/mutations.json` + `data/schemas/mutations.schema.json` (e.g., `extra_arms`, `keen_sight`, `tail`, …)

### Systems
- `src/systems/stats.js` — computeDerived: **base → add → add_pct → mult → clamp**; emits `stats:changed`
- `src/systems/equipment.js` — **22 slots** with two‑handed/off‑hand conflict, validate/equip/unequip; emits `equipment:changed`
  - `weapon_main, weapon_off, two_handed, ranged, quiver, head, face, neck, shoulders, chest, back, arms, wrists, hands, waist, legs, feet, ring_1, ring_2, trinket_1, trinket_2, charm`
- `src/systems/mutations.js` — 8 mutation sockets; applies `mods` and capacity flags into stats/equipment; emits `mutations:changed`

### UI
- `src/ui/inventory.js` — equipment board (`#eq-slot-<slot_id>`), drag/click equip, stat delta tooltips, applies `.modal-wide`
- `src/ui/character_sheet.js` — hotkey **C**, grouped stats + **Mutations** tab (`#mut-slot-1..8`)
- `styles/main.css` — `.equip-board` layout; ensure `.modal-inner.modal-wide` fits at 960/1200/1440

### Flags (default OFF)
- `STATS_V2_ENABLED`, `SLOTS_V2_ENABLED`, `CHAR_SHEET_ENABLED`, `MUTATIONS_V1_ENABLED`

### Tests
- **UI:** one item per slot equips; two‑hand ↔ shield conflicts enforced; sheet deltas match item `mods`; **no overflow**
- **Sim:** golden sheets for three archetypes; caps honored; mutation apply/remove shifts stats; conflicts enforced
- **Data:** migrate v2→v3 clean; schemas pass; no unknown IDs

### Acceptance
- Legacy and flagged paths **both green**; no console errors; **no horizontal scroll**

---

## Patch 2 — Crafting & Survival v1 (flagged, large)
**Goal:** Recipes/stations/tools + survival tickers (hunger/thirst/fatigue/temperature).

### Data
- `data/recipes.json` + `data/schemas/recipes.schema.json`
- `data/survival.json` + `data/schemas/survival.schema.json`
- `data/items.json` (v3) grows with resources/tools; optional `durability`

### Systems
- `src/systems/crafting.js` — `canCraft`, `craft`, stations, consumes inputs
- `src/systems/gathering.js` — tool‑gated nodes; seeded yields
- `src/systems/survival.js` — ticks pools; applies penalties as effects
- `src/systems/time.js` — day/night & temperature curve

### UI
- `src/ui/crafting.js` — searchable list, missing highlights, Craft ×1/×5, progress bar
- **Survival HUD** overlay: bars/icons with tooltips

### Flags
- `CRAFTING_V1_ENABLED`, `SURVIVAL_V1_ENABLED`

### Tests
- **UI:** craft `cooked_meat` at campfire; inputs ↓, output ↑
- **Survival:** cold biome near/away from fire; penalties apply/clear
- **Sim:** survival invariants; recipe validation (no cycles)

---

## Patch 3 — Items & Regions Content Drop v1 (flagged, huge data)
**Goal:** Massive items across `overworld`, `dungeon`, `heaven`, `inverted`; collectible sets & codex.

### Data
- `data/items.json` (v3) populated heavily
- `data/loot_tables.json` + `data/schemas/loot_tables.schema.json`
- `data/collectibles.json` + `data/schemas/collectibles.schema.json`

### Systems/UI
- `src/systems/loot.js` — region/biome/depth/room/event‑tag lookup; **first free adjacent** spawn
- `src/game/mapgen/placement_rules.js` — scatter pass
- Scenes call scatter on load/transition
- `src/ui/codex.js` — collectibles/lore sets

### Flags
- `REGIONS_V1_ENABLED`, `ITEM_SCATTER_V1_ENABLED`, `COLLECTIBLES_V1_ENABLED`

### Tests
- **UI:** items visibly present **immediately**; piles non‑blocking/persistent; codex updates
- **Sim:** 5k rolls per table — distributions within tolerance; spawn legality
- **Visual:** no overflow at 960/1200/1440

---

## Patch 4 — Encounter & Lore Engine v1 (flagged)
**Goal:** Random encounters with choices; lore unlocks; faction bumps.

### Data
- `data/encounters.json` + `data/schemas/encounters.schema.json`
- `data/lore.json` + schema
- `data/factions.json` + schema

### Systems/UI
- `src/systems/encounters.js` — `when/conditions/choices/effects` + cooldowns
- `src/ui/encounter_modal.js` — rich text, 1–5 hotkeys, logs to codex
- `src/ui/codex.js` expands (history)
- Scenes call `maybeTriggerEncounter()` at safe ticks

### Flags
- `ENCOUNTERS_V1_ENABLED`, `LORE_V1_ENABLED`, `FACTIONS_V1_ENABLED`

### Tests
- **UI:** force event; pick choice via keyboard; outcomes applied; close cleanly
- **Sim:** engine invariants (no infinite chains; cooldowns; stable weights)
- **Data:** references resolve; schemas pass

---

## Patch 5 — Morality & Meta Progression v1 (flagged)
**Goal:** 4‑axis morality persists between runs; world reacts.

### Data
- `data/schemas/profile.schema.json`
- `data/morality_rules.json`

### Systems/UI
- `src/core/profile.js` — localStorage + Export/Import JSON
- `src/systems/morality.js` — axes −100..+100; tags; hooks into economy/encounters
- `src/systems/economy.js` (touch): vendor price multipliers
- `src/ui/profile_panel.js` — axes, last 10 decisions, export/import

### Flags
- `MORALITY_V1_ENABLED`, `PROFILE_V1_ENABLED`

### Tests
- **UI:** choice changes axis → end run → new run shows persisted profile; export/clear/import restore
- **Sim:** clamped arithmetic; prices never negative/NaN; probabilities re‑normalize

---

## Patch 6 — Companions & Loyalty v1 (flagged, optional next)
- Data: `data/companions.json`
- Systems: recruit/dismiss; roles (Skirmisher/Healer); loyalty modifiers
- UI: companions panel; command pings
- Flag: `COMPANIONS_V1_ENABLED`
- Tests: recruit; loyalty gate; role acts in combat

---

## Patch 7 — Sockets/Runes & World Anomalies v1 (flagged)
- Data: `data/runes.json`, `data/runewords.json`, `data/anomalies.json`
- Systems: socket legality; runeword recognition; floor modifiers
- UI: socketing modal; anomaly banner
- Flags: `RUNES_V1_ENABLED`, `ANOMALIES_V1_ENABLED`
- Tests: DPS deltas match; modifiers apply/remit; no double‑stack

---

## Patch 8 — Faction Warfare & Dynamic Economy v1 (flagged)
- Data: `data/strongholds.json`, `data/economy_rules.json`
- Systems: territory control; caravans shift supply/demand
- UI: map overlay; vendor stock/price changes
- Flags: `FACTIONS_WAR_V1`, `ECON_V3_ENABLED`
- Tests: territory flips in sim; bounded price movement; no arbitrage loops

---

## Patch 9 — Weather/Seasons & Hunting/Tracking v1 (flagged)
- Data: `data/weather.json`, `data/traps.json`, `data/game_animals.json`
- Systems: terrain/element combos; tracking & traps; butchering
- UI: weather icon; track visuals; cooking buffs
- Flags: `WEATHER_V1_ENABLED`, `TRACKING_V1_ENABLED`
- Tests: combos behave; track quality by `per`; trap outcomes deterministic

---

## Patch 10 — Crime/Justice & Injuries/Scars v1 (flagged)
- Data: `data/law_rules.json`, `data/injuries.json`
- Systems: suspicion/bounty; jail/escape; injuries→treatment→scars
- UI: bounty indicator; healer UI
- Flags: `JUSTICE_V1_ENABLED`, `INJURIES_V1_ENABLED`
- Tests: bounty accrual/decay; jail path; injuries/scars persist

---

## Ship Checklist (every patch)
- Include: `VERSION.json`, `PATCH_NOTES.md`, `INSTALL.md`, `SMOKE_TEST.md`
- Feature flags default **OFF**; CI runs both legacy & flagged matrix
- No regressions; no console errors; modal containment at 960/1200/1440
