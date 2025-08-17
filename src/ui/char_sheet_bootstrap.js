/*
 Depthbound — src/ui/char_sheet_bootstrap.js (v0.5.5)
 Purpose: Bind **P** (Profile) to open Character Sheet, avoiding any conflict with Inventory.
 Notes:
  - Uses window capture + stopImmediatePropagation to prevent accidental fallthroughs.
  - Does NOT touch Inventory bindings.
*/
import { FLAGS } from '../core/feature_flags.js';
import { openCharacterSheet } from './character_sheet.js';
import { isUiActive } from './ui_state.js';

function wantsCharSheet(ev){
  const k = ev.key || '';
  return ev.code === 'KeyP' || k === 'p' || k === 'P';
}

function onKeyDownCapture(ev){
  if (!FLAGS.CHAR_SHEET_ENABLED) return;
  if (!wantsCharSheet(ev)) return;
  ev.preventDefault();
  if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
  ev.stopPropagation();
  if (!isUiActive()) openCharacterSheet({ force: true });
}

if (typeof window !== 'undefined'){
  if (!window.__db_char_sheet_bound) {
    window.__db_char_sheet_bound = true;
    window.addEventListener('keydown', onKeyDownCapture, { capture: true });
  }
}
