# INSTALL — Infra v0.1.0 (CI + headless smoke)

1) Put these files at the **repo root** (same folder as `index.html`). They do **not** touch your app code.
2) Commit and push to GitHub (`main` or `master`). This triggers the **Smoke** workflow.
3) Optional local run:
   ```bash
   npm i
   npx playwright install --with-deps
   npm run test:smoke
   ```
Artifacts (screenshots/trace) upload automatically on failures in CI.
