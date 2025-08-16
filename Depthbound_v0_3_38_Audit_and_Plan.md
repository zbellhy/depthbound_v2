# Depthbound v0.3.38 — Code Audit & Architecture Plan
_Generated: 2025-08-15 18:13 UTC_

## Executive Summary
- Input/Pause centralization appears present (pause.js detected), and Vendor/Loot UIs largely consistent. The remaining risk is ensuring **every** UI uses the UI stack and capture-phase Esc.
- Scenes (Town/Caves) should **not** call `openPause` directly; they should rely on the global handler; verify removal.
- Inventory/loot systems are sound for MVP. Recommend consolidating **data contracts** and adding **type guards/validators** to avoid runtime drift.

## Repository Stats
- Total JS files scanned: **34**
- Total LOC (JS): **2138**
- Largest files:
  - src/game/render.js: 232 lines
  - src/ui/inventory.js: 212 lines
  - src/game/scenes/caves.js: 211 lines
  - src/game/scenes/town.js: 187 lines
  - src/game/scenes/title.js: 126 lines
  - src/game/worldgen/caves_gen.js: 126 lines
  - src/systems/loot.js: 120 lines
  - src/ui/loot_window.js: 93 lines
  - src/game/scenes/character_create.js: 69 lines
  - src/core/overlays.js: 67 lines

## Architecture Checks
- Single Input construction detected: OK
- Global Esc bound in main.js to Pause handler: OK
- Vendor: capture-phase Esc listener present: OK
- Vendor: Esc swallow + latch present: OK
- Vendor: Missing UI stack enter/exit
- Loot: capture-phase + swallow present: OK
- Loot: returns Promise/remaining items: OK
- src/game/scenes/town.js: UI gate markers present
- src/game/scenes/town.js: direct Esc→openPause still present (should be removed)
- src/game/scenes/caves.js: UI gate markers present
- src/game/scenes/caves.js: direct Esc→openPause still present (should be removed)

## Esc/Modal Control Plane (Current)
- `src/core/pause.js` — global gate, opened via `main.js` Esc binding.
- `src/ui/ui_state.js` — UI stack (`enterUi/exitUi`), latches, visibility helpers.
- UIs (`inventory.js`, `loot_window.js`, `shop.js`) — capture-phase Esc, swallow, latch, and UI stack.
- Scenes — should not read Esc directly. If any scene still calls `openPause` on Esc, remove it and rely on global gate.

## Data & Systems
- **Loot/Items (`src/systems/loot.js`)**: recommend a single `schema_version` and JSON validation (e.g., light runtime checks) to avoid mismatches.
- **Map/Render**: modern canvas shapes look good; consider a **draw layer** enum (floor/entities/effects/overlay) to simplify later sprite introduction.
- **Entities**: Player + Goblin exist. Suggest moving toward a light component model (Position, Actor, AI, Lootable) with plain objects to keep perf simple.

## Code Quality Opportunities
- Add **barrel modules**: `src/ui/index.js`, `src/game/scenes/index.js` to enforce single import paths.
- Add **runtime asserts** (dev only) to warn on multiple `Input` instances or stray `keydown` listeners.
- Add **SMOKE_TEST.md** checklist for new UIs: Capturing, Swallowing, Latching, UI stack on open/close.
- Convert ad-hoc constants to small **config objects** in `src/core/config.js` (grid, palette, timings, keymap).

## Known/Probable Issues to Watch
- If any modal is opened without `enterUi()`, the global gate won't block Pause.
- If a scene keeps an old `anyJustPressed('Escape')` call, Pause could reappear; ensure removal.
- If loot UI doesn't return remaining items in this branch, persistence may break; confirm your current `loot_window.js` returns a Promise or that scene logic doesn't rely on it.

## Recommended Architectural Enhancements (Immediately Safe)
1. **UI Barrel & Assertions**
   - Create `src/ui/index.js` that re-exports `openInventory`, `openLootWindow`, `openShop`.
   - Dev assert: when opening a UI, verify `isUiActive()` increments and decrements around lifecycle.
2. **Single Input Assertion**
   - In `src/core/input.js`, export a singleton ID and warn on duplicate construction in dev mode.
3. **Scene Contract**
   - First lines of `update()`: if `isUiActive()` or `state.uiBlockFrames>0`, return early. Avoid any Esc logic in scenes.
4. **Data Contracts**
   - Add a tiny `validateItem(item)` when loading DB; log once per invalid entry.
5. **Save/Schema Discipline**
   - Keep `schema_versions` in `VERSION.json`; add migration notes per sprint (you already do this — great).

## Sprint-02 Proposal (Depth & Mechanics)
**Theme:** From MVP to a playable loop with build choices.
- **Combat depth**
  - Weapon categories (light/heavy/ranged) with simple stat diffs; off-hand shields grant block %.
  - Status effects: bleed, poison, stun (turn-limited, icons in tooltip).
  - Simple AI behaviors: charger, coward, archer.
- **Progression & Economy**
  - Add Buy/Sell to vendor (fixed inventory per sprint); pricing based on rarity.
  - Gold sinks: potions, repairs (abstract durability).
- **Exploration**
  - Rooms gain tags (armory, infirmary) affecting loot tables.
  - Keys & locked doors (use in inventory; or E near door if key owned).
- **UX polish**
  - Damage/heal pop numbers; hit/miss SFX; subtle screen shake on crits.
  - Settings modal: keybinds, audio sliders, toggles (minimap on/off).
- **Stability**
  - Add `SMOKE_TEST.md` and CI-style checklist for UIs and Esc handling.

### Sprint-02 Deliverables & Acceptance
- Vendor buy/sell working; inventory delta reflected; gold updates persist.
- Goblin variants with two behaviors; status effect shows in tooltip and wears off.
- Key/locked door interaction; key item consumed or tracked.
- No regression on Esc handling across all UIs.
- `SMOKE_TEST.md` updated.

