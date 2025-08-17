# PATCH NOTES — Playwright Config + Dev Server v0.1.0 (2025-08-17)

**What this adds**
- `playwright.config.ts` with:
  - `testDir: ./tests`, headless Chromium, `baseURL: http://127.0.0.1:4173`
  - `webServer`: starts a tiny static server (`node tests/devserver.cjs`) so the game loads over HTTP
- `tests/devserver.cjs`: dependency-free static server; serves `index.html` for `/`

**Why**
- Your run failed earlier before tests due to environment assumptions. This patch guarantees a working HTTP server and baseURL, so tests can `page.goto('/index.html')` reliably.

**How to use**
1) Drop these two files in the repo root (config) and `tests/` (dev server).
2) Push; the Smoke workflow will start the web server automatically and run tests.
