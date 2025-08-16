/* Depthbound — src/core/input.js
   Purpose: Normalized keyboard input + simple binding + edge detection
   v0.4.1: ES5-safe singleton warning (no class fields).
*/
import { isUiActive, isEscapeConsumed, isPauseBlocked } from '../ui/ui_state.js';

export class Input{
  constructor(target){
    Input._instances = (Input._instances||0) + 1;
    if (Input._instances > 1){
      try{ console.warn('[Input] Multiple instances detected. This can cause ESC races.'); }catch(e){}
    }
    this.down = new Set();
    this.pressed = new Set();
    this.bindings = new Map();
    target.addEventListener('keydown', (e)=>{
      if (!this.down.has(e.code)){ this.pressed.add(e.code); }
      this.down.add(e.code);
      if (e.repeat) return;
      const cb = this.bindings.get(e.code);
      if (cb){ try { cb(e); } catch(err){ console.error(err); } }
    }, false);
    target.addEventListener('keyup', (e)=>{ this.down.delete(e.code); }, false);
  }
  isDown(code){ return this.down.has(code); }
  bind(code, cb){ this.bindings.set(code, cb); }
  swallowEscapeEdge(){ this.pressed.delete('Escape'); this.down.delete('Escape'); }

  _globalEscSuppressed(){
    try{
      return (typeof window!=='undefined') && window.DB_ESC_SUPPRESS_UNTIL && Date.now() < window.DB_ESC_SUPPRESS_UNTIL;
    }catch(e){ return false; }
  }
  _escBlocked(){
    try{ return this._globalEscSuppressed() || isUiActive() || isEscapeConsumed() || isPauseBlocked(); }
    catch(e){ return this._globalEscSuppressed(); }
  }

  justPressed(code){
    if (code === 'Escape' && this._escBlocked()){
      this.pressed.delete('Escape');
      return false;
    }
    if (this.pressed.has(code)){
      this.pressed.delete(code);
      return true;
    }
    return false;
  }
  anyJustPressed(codes){
    for (const c of codes){
      if (c === 'Escape' && this._escBlocked()){
        this.pressed.delete('Escape');
        continue;
      }
      if (this.justPressed(c)) return c;
    }
    return null;
  }
}
