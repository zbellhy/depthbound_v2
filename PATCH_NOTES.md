# PATCH NOTES — Infra v0.1.10 (2025-08-17)

**Change**
- **Always** runs `playwright install chromium` (still uses cached binaries), removing any conditional that could skip install.
- Pins CLI invocations to `@playwright/test@1.45.3` via `npx -y` for consistency across steps.

**Why**
- Your latest trace shows `browserType.launch` failed because the Chromium executable was missing. This workflow guarantees the binary is present every run.
