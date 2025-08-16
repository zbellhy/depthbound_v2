# SMOKE TEST — v0.4.12.1

1) Open Inventory while backpack contains items not present in `data/items.json` (e.g., apple, bandage).
   - Expected: No crash; unknown items render with '?' and a blank slot label.
2) Click unknown items: handler ignores equip/consume because item def is missing (non-breaking).
3) Known items still show proper slot abbreviations and equip/consume works.
4) Combat, loot, vendors remain unaffected. No console errors.
