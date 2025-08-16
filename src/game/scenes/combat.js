/* Depthbound — src/game/scenes/combat.js (v0.4.12-hotfix)
   Purpose: Dedicated turn-based combat scene (stateful) with status-effects integration
   Dependencies: ui/ui_state.js, game/render.js, ui/index.js (loot), systems/loot.js, systems/status_effects.js
   Touched systems: CavesScene (on victory -> loot spawn + enemy removal)
*/
import { enterUi, exitUi, consumeEscapeFor } from '../../ui/ui_state.js';
import { renderCanvas } from '../../game/render.js';
import { openLootWindow } from '../../ui/index.js';
import { getAdjacentOpenTile, rollGoblinDrop } from '../../systems/loot.js';
import { FLAGS } from '../../core/flags.js';
import { loadEffects, hasEffect, applyEffect, tickEffects, renderEffectText, procOnHit } from '../../systems/status_effects.js';

export class CombatScene{
  constructor({ state, prev, enemy }){
    this.sm = state.sceneManager;
    this.state = state;
    this.prev = prev;
    this.enemy = enemy;
    this._boundKey = this.onKeyDown.bind(this);
    this._alive = true;
    this._log = [];
  }
  onEnter(){
    enterUi();
    const m = document.getElementById('modal');
    const inner = document.getElementById('modal-inner');
    m.classList.remove('hidden');
    inner.classList.remove('modal-wide');
    inner.innerHTML = `
      <div class="combat-ui">
        <div class="row">
          <div><b>${this.enemy.name || 'Enemy'}</b></div>
          <div class="hpbar enemy"><span id="hp-enemy"></span></div>
        </div>
        <div class="row"><div class="effects enemy" id="fx-enemy"></div></div>
        <div class="row">
          <div><b>You</b></div>
          <div class="hpbar you"><span id="hp-you"></span></div>
        </div>
        <div class="row"><div class="effects you" id="fx-you"></div></div>
        <div class="row" style="margin-top:8px">
          <button class="button" id="btn-attack">Attack (Space)</button>
          <button class="button" id="btn-item" disabled>Item</button>
          <button class="button" id="btn-flee">Flee (F)</button>
        </div>
        <div class="log" id="log" style="margin-top:8px; max-height:180px; overflow:auto; border:1px solid #444; padding:6px; border-radius:8px;"></div>
      </div>`;
    this.updateBars();
    inner.querySelector('#btn-attack').onclick = ()=> this.playerAttack();
    inner.querySelector('#btn-flee').onclick = ()=> this.flee();
    window.addEventListener('keydown', this._boundKey, { capture: true });
    consumeEscapeFor(260);
    this.ensureEffectsLoaded();
    this.log(`A ${this.enemy.name||'foe'} approaches...`);
    this.render();
  }
  onExit(){
    this._alive = false;
    window.removeEventListener('keydown', this._boundKey, { capture: true });
    const m = document.getElementById('modal');
    if (m) m.classList.add('hidden');
    exitUi();
  }
  log(line){
    this._log.push(line);
    const el = document.getElementById('log');
    if (el){ el.textContent = this._log.join('\n'); el.scrollTop = el.scrollHeight; }
  }

  async ensureEffectsLoaded(){ try { await loadEffects(); } catch(_){} }
  maybeProcOnHit(attacker, defender){ if (!FLAGS.status_effects) return; try { procOnHit(this.state, attacker, defender); } catch(_){ } }
  tickActor(actor, label){
    if (!FLAGS.status_effects) return { total:0 };
    const rep = tickEffects(this.state, actor);
    if (rep.total>0){ this.log(`${label} suffers ${rep.total} damage from effects.`); }
    this.updateBars();
    return rep;
  }

  clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
  updateBars(){
    const you = this.state.player;
    const en = this.enemy;
    const youPct = this.clamp((you.hp|0) / Math.max(1, you.maxHp||10), 0, 1);
    const enPct  = this.clamp((en.hp|0) / Math.max(1, en.maxHp||10), 0, 1);
    const hpYou = document.getElementById('hp-you');
    const hpEn  = document.getElementById('hp-enemy');
    if (hpYou) hpYou.style.width = (youPct*100).toFixed(0) + '%';
    if (hpEn)  hpEn.style.width  = (enPct*100).toFixed(0) + '%';
    if (FLAGS.status_effects){
      const fxYou = document.getElementById('fx-you');
      const fxEn = document.getElementById('fx-enemy');
      if (fxYou) fxYou.textContent = renderEffectText(this.state.player);
      if (fxEn)  fxEn.textContent  = renderEffectText(this.enemy);
    }
  }
  roll(min,max){ const r = this.state.rng?.() ?? Math.random(); return Math.floor(r*(max-min+1))+min; }

  onKeyDown(e){
    e.stopPropagation();
    if (e.code === 'Space'){ e.preventDefault(); this.playerAttack(); }
    else if (e.code === 'KeyF'){ e.preventDefault(); this.flee(); }
    else if (e.code === 'Escape'){ e.preventDefault(); consumeEscapeFor(260); }
  }

  playerAttack(){
    if (!this._alive) return;
    const you = this.state.player;
    if (FLAGS.status_effects && hasEffect(you, 'stun')){
      this.log('You are stunned and cannot act!');
    } else {
      const dmg = Math.max(1, this.roll(you.pow?1:1, you.pow||2));
      this.enemy.hp = Math.max(0, (this.enemy.hp|0) - dmg);
      this.log(`You hit ${this.enemy.name||'the enemy'} for ${dmg}. (${this.enemy.hp} HP left)`);
      this.maybeProcOnHit(you, this.enemy);
      this.updateBars();
      if (this.enemy.hp <= 0){ this.victory(); return; }
    }
    if (FLAGS.status_effects){
      this.tickActor(this.enemy, this.enemy.name||'Enemy');
      if (this.enemy.hp <= 0){ this.victory(); return; }
    }
    if (!(FLAGS.status_effects && hasEffect(this.enemy, 'stun'))){
      const edmg = Math.max(1, this.roll(1, this.enemy.pow||2));
      you.hp = Math.max(0, (you.hp|0) - edmg);
      this.log(`${this.enemy.name||'Enemy'} hits you for ${edmg}. (${you.hp} HP left)`);
      this.maybeProcOnHit(this.enemy, you);
      this.updateBars();
      if (you.hp <= 0){ this.defeat(); return; }
    } else {
      this.log(`${this.enemy.name||'Enemy'} is stunned and cannot act!`);
    }
    if (FLAGS.status_effects){
      this.tickActor(you, 'You');
      if (you.hp <= 0){ this.defeat(); return; }
    }
  }

  async victory(){
    if (!this._alive) return;
    this.log(`You defeat the ${this.enemy.name||'foe'}!`);
    try { this.state.map.clearEntity(this.enemy); } catch(_){}
    if (Array.isArray(this.prev?.enemies)){
      this.prev.enemies = this.prev.enemies.filter(e=> e!==this.enemy);
    }
    this.enemy.dead = true;
    const drops = rollGoblinDrop(this.state) || [];
    if (drops.length){
      const around = { x: this.state.player.x, y: this.state.player.y };
      const spot = getAdjacentOpenTile(this.state, around.x, around.y);
      this.prev?.createLootPileAt?.(spot.x, spot.y, drops);
    }
    try{
      if (this.state.render?.invalidate) this.state.render.invalidate('combat_victory');
      else if (this.state.game?.dirty) this.state.game.dirty('entities');
      else requestAnimationFrame(()=>{});
    }catch(_){}
    this.sm.pop();
  }

  defeat(){
    this.log('You are defeated...');
    this.sm.pop();
    this.prev?.onPlayerDefeated?.();
  }

  flee(){
    this.log('You flee the combat.');
    this.sm.pop();
  }

  update(dt){}
  render(){
    renderCanvas(this.sm.screen, this.state);
  }
}
