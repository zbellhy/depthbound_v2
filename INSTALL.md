# INSTALL — Tests-only Safety Net (v0.4.14)

Copy the `tests/` folder into your repo root (same level as `index.html`). Commit and push.
Your GitHub Actions **Smoke** workflow will run Playwright and execute these tests.

Changes vs v0.4.13:
- `bootToTown` no longer requires a Character Create modal; it handles direct‑to‑Town or Enter‑to‑start flows.
- Inventory and Vendor specs are tolerant to different DOMs (`#inv-root` presence optional; fallback selectors).
