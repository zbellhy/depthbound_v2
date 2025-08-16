/* Depthbound — src/core/pause.js
   Purpose: Centralized Pause open gate (single path)
   Contract: handleGlobalEscape(state) - opens active scene's pause if allowed
*/
import { isUiActive, isEscapeConsumed, isPauseBlocked } from '../ui/ui_state.js';

export function handleGlobalEscape(state){
  // If any UI is active or Esc is latched/blocked, ignore
  if (isUiActive() || isEscapeConsumed() || isPauseBlocked()) return;
  const sm = state.sceneManager;
  const top = sm?.top?.();
  if (top && typeof top.openPause === 'function'){
    top.openPause();
  }
}
