/*
 Depthbound — src/ui/char_sheet_bootstrap.js (v0.5.3)
 Purpose: Bind 'C' to open the Character Sheet **before** any document-level handlers (inventory, etc.).
 Strategy: Attach to **window** with capture=true, call preventDefault + stopImmediatePropagation,
 so no other key handlers (even capture-phase on document) see the event.
*/
import { FLAGS } from '../core/feature_flags.js';
import { openCharacterSheet } from './character_sheet.js';
import { isUiActive } from './ui_state.js';

function wantsCharSheet(ev){
  const k = ev.key || '';
  return ev.code === 'KeyC' || k === 'c' || k === 'C';
}

function onKeyDownCapture(ev){
  if (!FLAGS.CHAR_SHEET_ENABLED) return;
  if (!wantsCharSheet(ev)) return;
  // Swallow the event **before** other capture/bubble listeners
  ev.preventDefault();
  // Stop other listeners on window/document from firing
  if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
  ev.stopPropagation();

  if (!isUiActive()){
    openCharacterSheet();
  }
}

// Attach at the **window** target, which receives capture events before document-level listeners.
if (typeof window !== 'undefined'){
  window.addEventListener('keydown', onKeyDownCapture, { capture: true });
}
