# PATCH NOTES — Infra v0.1.7 (2025-08-17)

**What changed**
- **Removes dependency on your `package.json`** scripts and devDependencies.
- Uses `npx -y @playwright/test@1.45.3` directly to **install** (when needed) and **run** tests.
- Keeps **Playwright browser caching** at `~/.cache/ms-playwright` so Chromium is only installed when the cache is cold.
- Cancels in-progress runs for the same branch via `concurrency`.

**Why**
- Your latest run failed very early (before test execution). This version works even if:
  - there is **no `package-lock.json`**
  - there is **no `test:smoke` script**
  - Playwright is **not** listed in `devDependencies`
