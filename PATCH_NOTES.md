# PATCH NOTES — Infra v0.1.9 (2025-08-17)

**Fixes**
- Resolves `"Some specified paths were not resolved, unable to cache dependencies."` by **creating the cache path**
  (`~/.cache/ms-playwright`) *before* invoking `actions/cache`.
- Removes npm dependency caching (your repo has no `package-lock.json` yet), which was the other cause of that message.

**What stays**
- Local install of `@playwright/test@1.45.3` so your TS config can `import '@playwright/test'`.
- Browser caching at `~/.cache/ms-playwright` (Chromium install skipped on warm cache).
- Concurrency cancels in‑progress runs for the same branch.
