# PATCH_NOTES — v0.5.4 (2025-08-17)
- Force Character Sheet on **C** even if Inventory opens in the same key event.
- Bootstrap calls `openCharacterSheet({force:true})`; the sheet gracefully exits any active UI and claims the latch.
- Still uses window-capture + stopImmediatePropagation to minimize races.
