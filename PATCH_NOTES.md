# PATCH_NOTES — Tests-only v0.4.13 (2025-08-17)

Adds Playwright mechanics tests (no app code changes):
- `tests/helpers.ts`
- `tests/inventory.spec.ts`
- `tests/vendor.spec.ts`

These run under your existing **Smoke** workflow. If a test fails, open the run and check the step logs and artifacts.
