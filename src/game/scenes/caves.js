/* Depthbound — src/game/scenes/caves.js
   Purpose: Dungeon exploration, loot, FOV, interactions, combat trigger
   v0.3.19: Auto-close loot windows for goblin drops and loot piles (chests unchanged)
*/
import { renderCanvas } from '../../game/render.js';
import { TILE } from '../../game/tile.js';
import { Player } from '../../game/entities/player.js';
import { Enemy } from '../../game/entities/enemy.js';
import { Loot } from '../../game/entities/loot.js';
import { LootPile } from '../../game/entities/lootpile.js';
import { buildCaves } from '../worldgen/caves_gen.js';
import { computeFOV } from '../../systems/fov.js';
import { moveEntity } from '../../systems/movement.js';
import { tryInteract } from '../../systems/interaction.js';
import { startDuel } from '../../systems/combat.js';
import { getAdjacentOpenTile } from '../../systems/loot.js';
import { loadItems, getItemMap, addToInventory, rollGoblinDrop, rollChestLoot, goldForRunInventory } from '../../systems/loot.js';
import { CONFIG } from '../../core/config.js';
import { Save } from '../save/save.js';
import { pickFloorSpawns } from '../../systems/spawn.js';
import { openLootWindow } from '../../ui/index.js';

import { isModalOpen, isEscapeConsumed, isPauseBlocked } from '../../ui/ui_state.js';

export class CavesScene{
  constructor(sm){
    this.sm = sm;
    this.enemies = [];
  }
  async onEnter(){
    const st = this.sm.state;
    const { map, start } = buildCaves(st, 50, 30);
    st.map = map;
    st.player = new Player({ x:start.x, y:start.y });
    map.setEntity(st.player);

    // Items DB
    const db = await loadItems();
    st.itemsDb = db;
    st.itemsById = getItemMap(db);
    st.run = st.run || { inventory:[], equipped:{ head:null, body:null, main_hand:null, off_hand:null, trinket:null } };
    st.profile = st.profile || { gold: 0 };

    // Registries
    st.chests = st.chests || new Map();
    st.lootpiles = st.lootpiles || [];

    // Enemies
    const spots = pickFloorSpawns(map, st.rng, { minCount: 12, maxCount: 18, avoid: st.player, minDist: 8, minSep: 4 });
    for (const s of spots){
      const e = new Enemy({ x:s.x, y:s.y, name:'Goblin' });
      this.enemies.push(e);
      map.setEntity(e);
    }

    this.updateFOV();
  }
  update(dt){
    const __st = this.sm.state;
    if (__st.uiActive || (__st.uiBlockFrames>0)){
      if (__st.uiBlockFrames>0) __st.uiBlockFrames--;
      return;
    }
    const st = this.sm.state;
    const input = st.input;
    let dx=0,dy=0, acted=false;
    if (input.anyJustPressed(['ArrowUp','KeyW'])) {dy=-1; acted=true;}
    else if (input.anyJustPressed(['ArrowDown','KeyS'])) {dy=1; acted=true;}
    else if (input.anyJustPressed(['ArrowLeft','KeyA'])) {dx=-1; acted=true;}
    else if (input.anyJustPressed(['ArrowRight','KeyD'])) {dx=1; acted=true;}

    if (acted){
      // Check target tile for an enemy BEFORE moving, so bump-to-duel works even if enemies are blocking.
      const tx = st.player.x + dx, ty = st.player.y + dy;
      const hit = this.enemies.find(e=> e.x===tx && e.y===ty);
      if (hit){
        startDuel(this, st, hit);
      } else {
        const moved = moveEntity(st, st.player, dx,dy);
        if (moved) this.updateFOV();
      }
    }
    if (input.anyJustPressed(['KeyE'])){
      if (tryInteract(st)){
        this.updateFOV();
      } else {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        for (const [dx,dy] of dirs){
          const x = st.player.x+dx, y = st.player.y+dy;
          const tile = st.map.get(x,y);
          const ent = st.map.entitiesByPos.get(st.map.idx(x,y));
          if (ent?.type==='lootpile'){ this.openLootPile(ent); return; }
          if (ent?.type==='loot'){ this.pickupLoot(ent); return; }
          const pile = st.lootpiles.find(p=> p.x===x && p.y===y);
          if (pile){ this.openLootPile(pile); return; }
          if (tile === TILE.CHEST){ this.handleChest(x,y); return; }
        }
      }
    }
  }
  render(){
    renderCanvas(this.sm.screen, this.sm.state);
    this.sm.state.overlays.updateDev(this.sm.state);
  }
  updateFOV(){
    const st = this.sm.state;
    const vis = computeFOV(st.map, st.player.x, st.player.y, st.fovRadius);
    st.visible = vis;
    for (const idx of vis) st.discovered.add(idx);
  }

  // Interaction hooks
  pickupLoot(ent){
    const st = this.sm.state;
    addToInventory(st, ent.itemId, ent.qty);
    st.map.clearEntity(ent);
    this.updateFOV();
  }

  // Chest: persist if not emptied; auto-close enabled
  async handleChest(x,y){
    const st = this.sm.state;
    const idx = st.map.idx(x,y);
    let items = st.chests.get(idx);
    if (!items){
      items = rollChestLoot(st);
      st.chests.set(idx, items.slice());
    }
    const remaining = await openLootWindow(st, items, { title: 'Chest', autoCloseOnEmpty: true });
    if (remaining && remaining.length){
      st.chests.set(idx, remaining.slice());
    } else {
      st.chests.delete(idx);
      st.map.set(x,y, TILE.FLOOR);
      this.updateFOV();
    }
  }

  onPlayerDefeated(){
    const st = this.sm.state;
    const gained = CONFIG.features.resetOnTownExit ? goldForRunInventory(st) : 0;
    st.profile.gold = (st.profile.gold||0) + gained;
    st.run.inventory = [];
    st.run.equipped = { head:null, body:null, main_hand:null, off_hand:null, trinket:null };
    Save.saveProfile({ ...(st.profile||{}), gold: st.profile.gold });
    import('./town.js').then(({TownScene})=> this.sm.swap(new TownScene(this.sm)));
  }
  onExitToTown(){
    this.onPlayerDefeated();
  }

  // Enemies → LootPile
  async removeEnemy(enemy){
    const st = this.sm.state;
    const ex = enemy.x, ey = enemy.y;
    st.map.clearEntity(enemy);
    const rolled = rollGoblinDrop(st);
    const drops = rolled ? (Array.isArray(rolled) ? rolled.slice() : [rolled]) : [];
    if (drops.length){
      const remaining = await openLootWindow(st, drops, { title: 'Goblin Loot', autoCloseOnEmpty: true });
      if (remaining && remaining.length){
        this.createLootPileAt(ex,ey,remaining);
      }
    }
    this.enemies = this.enemies.filter(e=>e!==enemy);
  }

  createLootPileAt(x,y,items){
    const st = this.sm.state;
    const existing = st.lootpiles.find(p=> p.x===x && p.y===y);
    if (existing){
      existing.items = items.slice();
    } else {
      const pile = new LootPile({ x, y, items: items.slice() });
      st.lootpiles.push(pile);
      try{ st.map.setEntity(pile); }catch(e){ /* ignore */ }
    }
    console.log('LootPile placed at', x,y, 'items=', items);
    this.updateFOV();
  }

  async openLootPile(pile){
    const st = this.sm.state;
    const remaining = await openLootWindow(st, pile.items, { title: 'Loot Pile', autoCloseOnEmpty: true });
    if (!remaining || remaining.length===0){
      try{ st.map.clearEntity(pile); }catch(e){ /* ignore */ }
      st.lootpiles = st.lootpiles.filter(p=> !(p.x===pile.x && p.y===pile.y));
    } else {
      pile.items = remaining.slice();
      try{ st.map.setEntity(pile); }catch(e){ /* ignore */ }
    }
    this.updateFOV();
  }

  openModal(html){
    const m = document.getElementById('modal');
    const inner = document.getElementById('modal-inner');
    inner.innerHTML = html;
    m.classList.remove('hidden');
    return inner;
  }
  closeModal(){ document.getElementById('modal').classList.add('hidden'); }
  openPause(){
    const inner = this.openModal(`<b>Pause</b><br/><div class="small">Sprint-01</div>
      <div style="margin-top:8px">
        <span class="button" id="btn-return">Return</span>
        <span class="button" id="btn-town">Return to Town</span>
      </div>`);
    inner.querySelector('#btn-return').onclick = ()=> this.closeModal();
    inner.querySelector('#btn-town').onclick = ()=>{ this.closeModal(); this.onExitToTown(); };
  }
}
