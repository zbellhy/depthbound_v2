# PATCH NOTES — Infra v0.1.1

- Hardened smoke test to **focus the canvas**, **focus document.body**, and **dispatch a window-level Escape keydown** if the first press doesn't open the modal.
- This fixes failures where Playwright's keyboard input didn't reach the game's capture-phase Esc handler because focus wasn't on the expected target.
- Files changed: `tests/smoke.spec.ts` only.
