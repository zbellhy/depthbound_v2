# NOTES

- This is a minimal smoke: it launches `/index.html`, fails on any console errors, and toggles the pause modal with Esc.
- Once this is green once, I can add mechanics checks (inventory equip, vendor buy/sell, bump-to-duel → combat) without touching your app code.
- The server is a static `http-server` on port 4173 configured in `playwright.config.ts`.
