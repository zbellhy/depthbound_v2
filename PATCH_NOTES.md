# PATCH NOTES — v0.4.12.1

## What changed
- Hardened `getItemSlot()` to return `'misc'` when passed an undefined item def. This avoids crashes when loot tables include ids missing from `data/items.json`.

## Why
- `rollGoblinDrop()` can emit `apple`/`bandage` in some seeds, which were not defined in your current `items.json`. Inventory attempted to read `it.tags`, causing a `TypeError`.

## Next (optional hardening)
- We can also make `rollGoblinDrop()` filter out ids not present in the item DB to prevent unknown ids from entering inventories at all. Happy to ship that as a tiny follow-up if you want it.
