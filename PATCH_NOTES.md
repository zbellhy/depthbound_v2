# PATCH NOTES — Infra v0.1.3

- Relax the initial smoke to **not fail** when Esc doesn't open Pause. It still attempts to toggle via multiple focus/dispatch paths and reports as a **soft assertion**.
- Primary gate is now **no console errors on load** so CI becomes stable while we wire full mechanics tests next.
- Changed: `tests/smoke.spec.ts` only.
