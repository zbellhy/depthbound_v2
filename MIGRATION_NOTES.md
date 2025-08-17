# MIGRATION_NOTES — items schema v2 → v3

v3 adds forward-looking fields used by the new stats/equipment pipeline:

- `equip`: which slots the item can occupy; e.g., `"slots": ["head"]` or `"two_handed": true`
- `mods`: array of stat modifications with typed operations
  ```json
  {"stat":"str","op":"add","value":1}
  {"stat":"hp_max","op":"add_pct","value":10}
  {"stat":"melee_damage","op":"mult","value":1.15}
  ```
- `reqs` (optional): stat requirements to equip
- `channels` (optional): damage/resist channels e.g. `phys`, `fire`, `poison`

The provided `scripts/migrate_items_v2_to_v3.js` reads `data/items.json` (sv=2) and writes `data/items.v3.migrated.json` (sv=3) as a **non‑destructive** output you can diff and review. No files are overwritten.
