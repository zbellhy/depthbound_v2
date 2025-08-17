# SMOKE_TEST — Manual checks after applying this patch

- Load the game locally; **everything should behave exactly as before**.
- No console errors about missing imports (we did not touch existing files).
- Repo now contains:
  - data/schemas/*.schema.json
  - data/stats.json
  - data/mutations.json
  - scripts/migrate_items_v2_to_v3.js
  - src/systems/{stats,equipment,mutations}.js
  - src/core/feature_flags.js
