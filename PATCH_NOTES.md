# PATCH NOTES — v0.5.1 (Patch 1 wiring + flags • 2025-08-17)

**What this does**
- **Flips feature flags ON** for: STATS_V2_ENABLED, SLOTS_V2_ENABLED, CHAR_SHEET_ENABLED, MUTATIONS_V1_ENABLED.
- **Wires a Character Sheet modal (press `C`)** that opens safely (capture-phase ESC, latches, `.modal-wide`).
- Adds a minimal equipment board (22 slot placeholders) and mutations panel (8 sockets). This is **UI-only** today—no gameplay changes.

**Changed files**
- `src/core/feature_flags.js` (flags → true)
- `styles/main.css` (adds `.char-sheet`, `.equip-board`, `.mutations-grid` rules — appended)
- `src/ui/char_sheet_bootstrap.js` (new) — binds key and manages modal lifecycle
- `src/ui/character_sheet.js` (new) — renders the sheet

**Safety**
- Uses existing `#modal` / `#modal-inner` container and `.modal-wide` pattern — no new modal framework.
- Capture-phase `keydown` with `preventDefault()` + `stopPropagation()` to avoid pause leaks.
- On close: `input.swallowEscapeEdge()` + `consumeEscapeFor(260)` + `exitUi()`.

**Revert**
- To turn off, set all flags back to `false` in `src/core/feature_flags.js`.
