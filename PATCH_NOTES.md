# PATCH_NOTES — v0.4.13 (tests-only)

**Added** Playwright mechanics tests (no app code changes):
- `tests/helpers.ts`: boot & UI helpers
- `tests/inventory.spec.ts`: Inventory opens/closes
- `tests/vendor.spec.ts`: Vendor opens with E near spawn; Buy/Sell render

These run under your existing **Smoke** workflow. If a test fails, open the run and check the step “Run smoke tests” for logs/artifacts.
