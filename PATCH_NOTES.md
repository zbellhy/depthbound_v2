# PATCH NOTES — v0.5.0 (Patch 1: Stats & Slots + Mutations v1 • 2025-08-17)

This patch delivers **safe scaffolding** for the big stat system, **22 equipment slots**, and **8 mutation slots**.
Features ship **flagged OFF** and **not wired** by default, so your current game behavior and CI remain unchanged.

## What’s included (new files only)
- **Data & Schemas**
  - `data/stats.json` — core & derived stats, channels, caps
  - `data/mutations.json` — 8-slot mutation definitions (sample set)
  - `data/schemas/stats.schema.json`
  - `data/schemas/mutations.schema.json`
  - `data/schemas/items.v3.schema.json` — forward schema for item `mods`/`equip` fields
  - `scripts/migrate_items_v2_to_v3.js` + `MIGRATION_NOTES.md`

- **Systems (not yet imported)**
  - `src/systems/stats.js` — base→add→add_pct→mult→clamp
  - `src/systems/equipment.js` — validates/equips **22 slots**
  - `src/systems/mutations.js` — applies mutation mods to stats

- **Flags (not referenced yet)**
  - `src/core/feature_flags.js` — all defaults **false**

- **Docs**
  - `INSTALL.md` — how to apply safely
  - `SMOKE_TEST.md` — what to sanity check manually

## Safety
- **No existing files were modified.** These modules are dormant until we wire them in a follow-up **flag-flip micro‑patch**.
- CI remains **green** because nothing changes the current DOM or flows.

## Next
- After this lands green, I’ll ship a tiny wiring patch that:
  - imports the flags, and when ON, mounts: equipment board (22 slots), Character Sheet (**C**), and mutation sockets
  - stays fully reversible by flipping flags back to `false`
