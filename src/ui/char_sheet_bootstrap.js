/*
 Depthbound — src/ui/char_sheet_bootstrap.js (v0.5.4)
 Purpose: Make 'C' reliably open Character Sheet even if another UI (e.g., Inventory) is racing.
 Strategy: window capture; stopImmediatePropagation; call openCharacterSheet({force:true}).
*/
import { FLAGS } from '../core/feature_flags.js';
import { openCharacterSheet } from './character_sheet.js';

function wantsCharSheet(ev){
  const k = ev.key || '';
  return ev.code === 'KeyC' || k === 'c' || k === 'C';
}

function onKeyDownCapture(ev){
  if (!FLAGS.CHAR_SHEET_ENABLED) return;
  if (!wantsCharSheet(ev)) return;

  // Swallow earliest
  ev.preventDefault();
  if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
  ev.stopPropagation();

  // Force the Character Sheet even if another UI just activated in this same event loop
  openCharacterSheet({ force: true });
}

// Attach at window capture so we see the event as early as possible
if (typeof window !== 'undefined'){
  // de-dupe guard
  if (!window.__db_char_sheet_bound) {
    window.__db_char_sheet_bound = true;
    window.addEventListener('keydown', onKeyDownCapture, { capture: true });
  }
}
