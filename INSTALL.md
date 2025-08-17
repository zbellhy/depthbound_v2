# INSTALL — Tests-only Safety Net (v0.4.13)

Copy the `tests/` folder into your repo root (same level as `index.html`). Commit and push.
Your GitHub Actions **Smoke** workflow will run Playwright and execute these tests.

Includes:
- `tests/helpers.ts`: boot & UI helpers
- `tests/inventory.spec.ts`: Inventory opens/closes
- `tests/vendor.spec.ts`: Vendor opens with E near spawn; Buy/Sell visible
