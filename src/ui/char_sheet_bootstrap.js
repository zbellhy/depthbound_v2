/*
 Depthbound — src/ui/char_sheet_bootstrap.js
 Purpose: Bind 'C' to open the Character Sheet modal, guarded by feature flags.
 Dependencies: feature_flags, character_sheet, ui_state.
*/
import { FLAGS } from '../core/feature_flags.js';
import { openCharacterSheet } from './character_sheet.js';
import { isUiActive } from './ui_state.js';

function wantsCharSheet(ev){
  // Support both key and code for resilience
  return ev.code === 'KeyC' || ev.key === 'c' || ev.key === 'C';
}

function onKeyDownCapture(ev){
  if (!FLAGS.CHAR_SHEET_ENABLED) return;
  if (wantsCharSheet(ev) && !isUiActive()){
    ev.preventDefault();
    ev.stopPropagation();
    openCharacterSheet();
  }
}

if (typeof document !== 'undefined'){
  document.addEventListener('keydown', onKeyDownCapture, true);
}
