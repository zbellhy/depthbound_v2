# Depthbound — Code Audit (v? • 2025-08-15)

**Codename:** Depthbound • **Sprint:** ? • **Date:** ?

## Summary
Repository snapshot audited from *depthbound-v0_3_29.zip*. Focus areas: scene flow, rendering, inventory/shop/loot, vendors, FOV, input, and docs discipline.

### High-level status
- Title screen loads: ✅ (no parse blockers detected in audit)
- Town vendors present: ⚠️ check
- Chests + loot piles: ⚠️ check
- Inventory 5×4, centered: ✅ (inventory.js matches 5×4 grid and panel centering)
- Shop compatibility (ensureItems): ⚠️ missing export
- Tooltips near interactables: ⚠️ missing drawInteractionTooltip
- FOV / visibility: ⚠️ verify

## Directory Overview
Total files: 48
### depthbound-v0_3_29
- depthbound-v0_3_29/INSTALL.md
- depthbound-v0_3_29/KNOWN_ISSUES.md
- depthbound-v0_3_29/MIGRATION.md
- depthbound-v0_3_29/PATCH_NOTES.md
- depthbound-v0_3_29/README.md
- depthbound-v0_3_29/SMOKE_TEST.md
- depthbound-v0_3_29/VERSION.json
- depthbound-v0_3_29/index.html
- depthbound-v0_3_29/launch_game.bat
### depthbound-v0_3_29/data
- depthbound-v0_3_29/data/backgrounds.json
- depthbound-v0_3_29/data/birthsigns.json
- depthbound-v0_3_29/data/classes.json
- depthbound-v0_3_29/data/items.json
- depthbound-v0_3_29/data/perks.json
- depthbound-v0_3_29/data/races.json
### depthbound-v0_3_29/src
- depthbound-v0_3_29/src/main.js
### depthbound-v0_3_29/src/core
- depthbound-v0_3_29/src/core/config.js
- depthbound-v0_3_29/src/core/input.js
- depthbound-v0_3_29/src/core/overlays.js
- depthbound-v0_3_29/src/core/rng.js
- depthbound-v0_3_29/src/core/scene_manager.js
- depthbound-v0_3_29/src/core/state.js
- depthbound-v0_3_29/src/core/version.js
### depthbound-v0_3_29/src/game
- depthbound-v0_3_29/src/game/map.js
- depthbound-v0_3_29/src/game/render.js
- depthbound-v0_3_29/src/game/tile.js
### depthbound-v0_3_29/src/game/entities
- depthbound-v0_3_29/src/game/entities/enemy.js
- depthbound-v0_3_29/src/game/entities/entity.js
- depthbound-v0_3_29/src/game/entities/loot.js
- depthbound-v0_3_29/src/game/entities/lootpile.js
- depthbound-v0_3_29/src/game/entities/player.js
- depthbound-v0_3_29/src/game/entities/vendor.js
### depthbound-v0_3_29/src/game/save
- depthbound-v0_3_29/src/game/save/save.js
### depthbound-v0_3_29/src/game/scenes
- depthbound-v0_3_29/src/game/scenes/caves.js
- depthbound-v0_3_29/src/game/scenes/character_create.js
- depthbound-v0_3_29/src/game/scenes/title.js
- depthbound-v0_3_29/src/game/scenes/town.js
### depthbound-v0_3_29/src/game/worldgen
- depthbound-v0_3_29/src/game/worldgen/caves_gen.js
### depthbound-v0_3_29/src/systems
- depthbound-v0_3_29/src/systems/combat.js
- depthbound-v0_3_29/src/systems/fov.js
- depthbound-v0_3_29/src/systems/interaction.js
- depthbound-v0_3_29/src/systems/loot.js
- depthbound-v0_3_29/src/systems/movement.js
- depthbound-v0_3_29/src/systems/spawn.js
### depthbound-v0_3_29/src/ui
- depthbound-v0_3_29/src/ui/inventory.js
- depthbound-v0_3_29/src/ui/loot_window.js
- depthbound-v0_3_29/src/ui/shop.js
### depthbound-v0_3_29/styles
- depthbound-v0_3_29/styles/main.css

## Versioning
- VERSION.json: missing
- Parsed: n/a

## Standards Compliance (headers & docs)
- JS files with Depthbound header: 32/32
- Files missing header block:
(none found or skipped)
- Files with header missing fields (Purpose/Dependencies/Data contracts/Touched systems):
- depthbound-v0_3_29/src/game/entities/lootpile.js → missing: Purpose, Dependencies, Data contracts, Touched systems
- depthbound-v0_3_29/src/game/render.js → missing: Dependencies, Data contracts, Touched systems
- depthbound-v0_3_29/src/game/scenes/caves.js → missing: Dependencies, Data contracts, Touched systems
- depthbound-v0_3_29/src/ui/inventory.js → missing: Dependencies, Data contracts, Touched systems
- depthbound-v0_3_29/src/ui/loot_window.js → missing: Dependencies, Data contracts, Touched systems

## Key Systems Review
### Scenes
- **title.js**: present: False
- **town.js**: vendors created via `new Vendor(...)`, gate to `CavesScene`, E to interact, Escape pause: False
- **caves.js**: loot drops / lootpile: False, FOV updates present: False

### Rendering
- `render.js` includes `drawInteractionTooltip(...)`: False
- Entities drawn: player @, goblin g, loot circle, vendor diamond+window.

### Inventory & Shop
- `inventory.js` exports `ensureItems`: False
- `shop.js` references inventory items: False
- Min 20 slots: False

### Loot Window
- `loot_window.js` supports `autoCloseOnEmpty`: False

### Input / UX
- `core/input.js` includes bindings for inventory (I), minimap (M), help (H), F1/F9/tilde: False

## Risks & Issues
- Missing src/ui/inventory.js (expected).
- Tooltips may be missing from render.js (drawInteractionTooltip not found).
- Loot window may not auto-close on empty (autoCloseOnEmpty not found).
- Town vendors construction not found — verify TownScene placements.
- Goblin loot → lootpile flow not found in caves.js — verify persistence when closing window.
- FOV/shadow casting logic not detected — verify visibility updates in caves.
- Version overlay element not detected in index.html — ensure HUD shows version/date.
- Input bindings for I/M/H/F1/F9 not detected in core/input.js.

## Recommendations (immediate)
1. **Add a tiny `ui.css` or inline CSS reset** for the modal to ensure no external `max-width` clamps reappear. We currently override inline; a CSS token would be safer.
2. **Centralize entity type strings** (`'loot'`, `'lootpile'`, `'vendor'`) in a `const ENTITY_TYPES` object to reduce typos.
3. **Unify item schema**: ensure `items.json` (if present) carries `schema_version` and that `systems/loot.js` validates it.
4. **Guard FOV vs. tooltips**: when an entity is adjacent but not in FOV, we special-case drawing. Keep it consistent across all entity types (vendors, lootpile, chest).

## Longer-term Hardening
- Introduce **Scene contract tests** (lightweight): ensure each scene sets `state.map`, `state.player`, and updates `state.visible/discovered` on enter.
- Add **render smoke** that walks camera across a test map and saves a canvas image for visual diffs.
- Adopt a **module barrel** per domain (e.g., `entities/index.js`) for clean imports and less fragile paths.

---
*Generated automatically from repository contents and heuristics.*
