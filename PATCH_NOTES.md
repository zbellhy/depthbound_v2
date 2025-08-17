# PATCH NOTES — Infra v0.1.8 (2025-08-17)

**What changed**
- Installs `@playwright/test@1.45.3` **locally** before running, so configs that import `@playwright/test` resolve correctly.
- Keeps Playwright **browser caching** at `~/.cache/ms-playwright`; Chromium install is skipped on cache hit.
- Leaves your repo files untouched (no commits to `package.json`); changes exist only in the CI workspace.
- Cancels in‑progress runs on same branch.

**Why**
- Your run failed with `Cannot find module '@playwright/test'` from `playwright.config.ts`. This workflow guarantees the module is present.
