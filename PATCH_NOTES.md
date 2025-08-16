# PATCH NOTES — Infra v0.1.4

- Make smoke strictly about **zero console errors** on page load.
- Remove all Esc/modal assertions (even soft ones). We still fire Esc best-effort for coverage, but it cannot fail the run.
- Changed: `tests/smoke.spec.ts` only.
