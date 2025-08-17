# INSTALL — Hotfix v0.5.3
1) Unzip into repo **root**.
2) Commit: `hotfix: v0.5.3 make C open Character Sheet first` → Push.
3) Run the game → press **C**: Character Sheet should open (not Inventory). Press **Esc** to close.
Notes:
- The binder now listens on **window** (capture) and calls `stopImmediatePropagation()` so Inventory can't swallow the key first.
- If it *still* opens Inventory, add this import at the very top of `src/ui/index.js`:
  ```js
  import './char_sheet_bootstrap.js';
  ```
  (It ensures the binder is loaded.)
