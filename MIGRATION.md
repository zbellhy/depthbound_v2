# MIGRATION — Sprint-01 (`v0.3.0`)

## Data schema changes
- **`data/items.json`** introduced with `schema_version: 2`.

### Compatibility
- Inventory & equipment are **run-scoped** (cleared at end of run).
- Gold persists in `profile.gold`. Existing profiles without `gold` will default to `0` automatically when first saved.

### Rollback
- To rollback to `v0.2.x`, remove UI code that references inventory/shop and delete `data/items.json`. No other schema changes were made.
