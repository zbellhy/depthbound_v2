/* Depthbound — src/ui/ui_state.js
   Purpose: Shared UI state helpers (UI active flag + ESC latch)
*/
let escConsumedUntil = 0;
let pauseBlockedUntil = 0;
let uiDepth = 0;

export function isModalOpen(){
  const m = document.getElementById('modal');
  return !!(m && !m.classList.contains('hidden'));
}
export function enterUi(){ uiDepth = (uiDepth|0) + 1; }
export function exitUi(){ uiDepth = Math.max(0, (uiDepth|0) - 1); }
export function isUiActive(){ return uiDepth > 0 || isModalOpen(); }

export function consumeEscapeFor(ms=220){
  const now = Date.now(); const until = now + Math.max(0, ms|0);
  escConsumedUntil = Math.max(escConsumedUntil, until);
  pauseBlockedUntil = Math.max(pauseBlockedUntil, until);
  try{ if (typeof window!=='undefined'){ window.DB_ESC_SUPPRESS_UNTIL = Math.max(window.DB_ESC_SUPPRESS_UNTIL||0, until); } }catch(e){}
}
export function isEscapeConsumed(){ return Date.now() < escConsumedUntil; }
export function isPauseBlocked(){ return Date.now() < pauseBlockedUntil; }
