# INSTALL — Mechanics Tests v0.4.13 (tests-only)

Copy the `tests/` folder contents into your repo root (next to `index.html`).  
Commit and push — your **Smoke** workflow will run Playwright and execute these tests.

**Included tests**:
- `inventory.spec.ts`: open/close Inventory with `I`.
- `vendor.spec.ts`: open Vendor near spawn with `E`, assert Buy/Sell lists, close.

> These tests do **not** change app code. They click the canvas to ensure focus, then drive the app via keyboard and visible DOM.
