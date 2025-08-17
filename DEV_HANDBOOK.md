# DEV_HANDBOOK — Process & GitHub Guide
Date: 2025-08-17

This is the **single source of truth** for how we build, test, and ship Depthbound quickly without regressions.

---

## Golden Rules (non‑negotiable)
- **Zip patches only** with **changed/new files only**. Every patch includes `VERSION.json`, `PATCH_NOTES.md`, `INSTALL.md`, `SMOKE_TEST.md`.
- **No green CI, no ZIP.** We gate every change in GitHub Actions (headless Chromium).
- **Never regress.** Each bug becomes a permanent test.
- **Feature flags** for risky changes; **migrations** for schema bumps.
- **IDs** are `lower_snake_case`; files kebab‑case; exported classes PascalCase.
- HUD shows `Depthbound • vX.Y.Z • YYYY‑MM‑DD`.

---

## Repository Setup

### Make the repo public (fastest)
1. GitHub → open the repo.
2. **Settings → General**.
3. Scroll to **Danger Zone** → **Change repository visibility** → **Make public**.
4. Confirm by typing the repo name.

### OR create a public mirror (keep main private)
1. GitHub (top right) **+ → Import repository**.
2. Paste your private repo’s HTTPS URL.
3. Name it (e.g., `depthbound_public`) → **Public → Begin import**.

### Turn on GitHub Actions
- Repo → **Settings → Actions → General** → “Allow all actions”.

### Branch protection (recommended)
- **Settings → Branches → Add rule**: protect `main`.
- Require status checks to pass: **Smoke** (the Actions workflow name).
- Optional: require PRs (we can commit to `main` directly if speed > review).

---

## CI Workflow (what’s running)
- Location: `.github/workflows/smoke.yml`
- **Caching:** npm + Playwright browsers; **Chromium only** installed; cache keys from `package-lock.json`.
- **Concurrency:** cancels in‑progress runs on the same branch.
- **Artifacts on failure:** screenshots & traces are uploaded.

### Verify cache is working
- Open **Actions → Smoke run** → check logs:
  - “Cache Playwright browsers” → **Cache restored** (after first run).
  - “Install Chromium … (skip if cached)” → should be **skipped** on cache hits.
  - `npm ci` runs fast with `setup-node` cache.

### Optional path filters (skip CI on docs‑only PRs)
Add under `on:` in the workflow:
```yaml
on:
  push:
    branches: [ main ]
    paths-ignore:
      - '**/*.md'
      - 'docs/**'
```

---

## Applying a Patch ZIP

### GitHub Desktop (no terminal)
1. **Repository → Show in Explorer**.
2. Unzip the patch; **copy contents into the repo root** (same level as `index.html`, `.github/`, `src/`, `data/`).
3. Desktop: enter a Summary (e.g., `v0.5.0 — Stats & Slots + Mutations v1 (flags off)`).
4. Click **Commit to main**, then **Push origin**.
5. GitHub → **Actions** → watch the **Smoke** run.

### Website (alternate)
1. Repo → **Code → Add file → Upload files**.
2. Drag patch contents into the root → **Commit changes**.

### If the Commit button is disabled
- You copied into the wrong folder (no changed files) **or** Summary is empty.
- Use **Repository → Show in Explorer** to confirm path; ensure `index.html` is present there.

---

## Reading CI Results
- Repo → **Actions** → select the latest run.
- Click **Run smoke tests** for failure details.
- If there’s a failure, download **artifacts** (screenshots/traces) from the run for visual context.
- I will ship a **tests‑only** or **fix** patch next; you just apply and push.

### Cancel a running workflow
- On the run page → top right **… → Cancel workflow run**.

---

## Local Test (optional)
- Install Node 20.
- In repo root:
  ```bash
  npm ci
  npx playwright install chromium
  npm run test:smoke
  ```
- Not required (CI runs this automatically).

---

## Updating / Growing Tests (what expands automatically)
- We **auto‑derive tests** from code/data:
  - New UI modals: added **containment & ESC latch** checks
  - New equip slots/effects: added **equip/apply/tick/expire** checks
  - New encounters/items: **ID cross‑refs** and **distribution** checks
- Every prior failure becomes a watchlist test forever.

If a test fails and you need to move forward, I can ship a **tests‑only** patch that adjusts assertions to the new intended behavior *after* confirming the mechanic.

---

## .gitignore (recommended)
Create/update `.gitignore` with:
```
# Node & Playwright
node_modules/
playwright-report/
test-results/
**/.cache/
**/.playwright/
**/.vite/
dist/
.tmp/

# OS files
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local override files
.env
.env.local
```

---

## Releases & Tags (optional but helpful)
- After a green run, create a **Release**:
  - **Releases → Draft a new release**
  - Tag: `vX.Y.Z` (matches `VERSION.json`)
  - Title: same
  - Notes: paste `PATCH_NOTES.md`
  - Attach the same **ZIP** you applied

---

## Rollbacks (if ever needed)
- GitHub Desktop: **History → right‑click a commit → Revert this commit** → Push.
- Or open the failing commit on the website and click **Revert**.

---

## Troubleshooting
- **Actions tab missing** → enable Actions in repo Settings.
- **Caches never restore** → you changed `package-lock.json`; next run will re‑prime cache; subsequent runs will be fast.
- **Headless tests flaky** → we focus canvas first and dispatch events at `window` level. If a spec still flakes, I’ll harden it and re‑ship tests‑only.
- **Modal overflow** → ensure `.modal-inner.modal-wide` rule exists and is applied on open; tests will flag horizontal scroll.

---

## Division of Responsibility
- **You**: copy ZIPs, commit, push; keep repo readable (public or mirrored).
- **Me**: implement features behind flags, write migrations, expand tests, keep CI green, deliver only green ZIPs.
