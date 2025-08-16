/* Depthbound — src/systems/loot.js (v0.4.6)
   Purpose:
     - Provide item DB helpers (loadItems, getItemMap, itemValue)
     - Provide inventory ops (addToInventory, removeFromInventory, goldForRunInventory)
     - Provide drop tables (rollGoblinDrop, rollChestLoot)
     - Provide world loot helpers (getAdjacentOpenTile, spawnLootPile, spawnLootPileAt)
     - Keep public surface compatible with existing imports.
   Contracts:
     - items.json schema_version=2: { items: [ { id, name, value, stackable, max_stack, ... } ] }
*/
let __itemsDb = null;
let __itemsMap = null;

export async function loadItems(){
  if (__itemsDb) return __itemsDb;
  const res = await fetch('data/items.json', { cache: 'no-store' });
  const db = await res.json();
  __itemsDb = db;
  __itemsMap = getItemMap(db);
  return db;
}

export function getItemMap(db){
  const src = db || __itemsDb || { items: [] };
  const map = new Map();
  for (const it of (src.items||[])) map.set(it.id, it);
  return map;
}

export function itemValue(def){
  const v = (def && typeof def.value==='number') ? def.value : 1;
  return Math.max(0, v|0);
}

export function addToInventory(state, itemId, qty=1){
  const run = (state.run ||= { inventory: [], equipped: {} });
  const inv = (run.inventory ||= []);
  const idx = inv.findIndex(e=> e.id===itemId);
  if (idx>=0){
    inv[idx].qty = (inv[idx].qty||1) + qty;
  } else {
    inv.push({ id:itemId, qty: qty });
  }
  return inv[idx>=0?idx:inv.length-1].qty;
}

export function removeFromInventory(state, itemId, qty=1){
  const run = (state.run ||= { inventory: [], equipped: {} });
  const inv = (run.inventory ||= []);
  const idx = inv.findIndex(e=> e.id===itemId);
  if (idx<0) return 0;
  inv[idx].qty = Math.max(0, (inv[idx].qty||0) - qty);
  if (inv[idx].qty===0) inv.splice(idx,1);
  return inv[idx]?.qty || 0;
}

export function goldForRunInventory(state){
  const map = state.itemsById || __itemsMap || getItemMap(__itemsDb||{ items:[] });
  const inv = state.run?.inventory || [];
  let total = 0;
  for (const entry of inv){
    const def = map.get(entry.id);
    if (!def) continue;
    total += itemValue(def) * (entry.qty||1);
  }
  return total;
}

// ---------------- Drop tables (lightweight, data-driven-ish) ----------------

function pickWeighted(rng, entries){
  const sum = entries.reduce((a,e)=>a+e.w, 0);
  let r = rng()*sum;
  for (const e of entries){ if ((r-=e.w) <= 0) return e; }
  return entries[entries.length-1];
}

export function rollGoblinDrop(state){
  // Fallback table if DB not yet loaded: basic IDs commonly present in starter DBs
  const rng = state.rng || Math.random;
  const table = [
    { id:'bandage',  qty:[1,2],  w: 4 },
    { id:'throwing_knife', qty:[1,3], w: 3 },
    { id:'apple',    qty:[1,2],  w: 3 },
    { id:'rusted_dagger', qty:[1,1], w: 1 },
  ];
  const pick = pickWeighted(rng, table);
  const q = Array.isArray(pick.qty) ? Math.floor(rng()*(pick.qty[1]-pick.qty[0]+1))+pick.qty[0] : (pick.qty||1);
  return [{ id: pick.id, qty: q }];
}

export function rollChestLoot(state){
  // Extremely simple: 2–3 items using goblin table twice
  const a = rollGoblinDrop(state)[0];
  const b = rollGoblinDrop(state)[0];
  const c = (state.rng?.()||Math.random()) < 0.4 ? rollGoblinDrop(state)[0] : null;
  return [a,b].concat(c? [c] : []);
}

// ---------------- World helpers ----------------

function isWalkable(map, x, y){
  if (!map) return true;
  try {
    if (typeof map.isWalkable === 'function') return !!map.isWalkable(x,y);
    if (typeof map.isPassable === 'function') return !!map.isPassable(x,y);
    if (typeof map.isBlocked === 'function') return !map.isBlocked(x,y);
    if (typeof map.hasObstacle === 'function') return !map.hasObstacle(x,y);
  } catch(_){}
  return true;
}

function neighborsCardinal(x,y){
  return [ {x,y:y-1}, {x:x+1,y}, {x,y:y+1}, {x:x-1,y} ];
}

function ringAround(x,y,r){
  const pts=[];
  for (let dx=-r; dx<=r; dx++){ pts.push({x:x+dx,y:y-r}); pts.push({x:x+dx,y:y+r}); }
  for (let dy=-r+1; dy<=r-1; dy++){ pts.push({x:x-r,y:y+dy}); pts.push({x:x+r,y:y+dy}); }
  return pts;
}

export function getAdjacentOpenTile(state, aroundX, aroundY){
  const map = state?.map;
  for (const n of neighborsCardinal(aroundX, aroundY)){ if (isWalkable(map, n.x, n.y)) return n; }
  for (let r=2; r<=6; r++){ for (const pt of ringAround(aroundX, aroundY, r)){ if (isWalkable(map, pt.x, pt.y)) return pt; } }
  return { x: aroundX, y: aroundY };
}

export function spawnLootPile(state, origin, items){
  const px = state.player?.x ?? origin.x;
  const py = state.player?.y ?? origin.y;
  const spot = getAdjacentOpenTile(state, px, py);
  return spawnLootPileAt(state, spot.x, spot.y, items);
}

export function spawnLootPileAt(state, x, y, items){
  // Ensure lootpiles array exists
  const st = state;
  st.lootpiles = st.lootpiles || [];
  const pile = { type:'lootpile', x, y, items: Array.isArray(items) ? items.map(e=>({id:e.id, qty:e.qty||1})) : [], ch:'*' };
  st.lootpiles.push(pile);
  try { st.map.setEntity(pile); } catch(_){}
  // request a frame so it shows up even if a modal is open
  try {
    if (state.render?.invalidate) state.render.invalidate('loot_spawn');
    else if (state.game?.dirty) state.game.dirty('entities');
    else requestAnimationFrame(()=>{});
  } catch(_){}
  return pile;
}

export default {
  loadItems, getItemMap, itemValue,
  addToInventory, removeFromInventory, goldForRunInventory,
  rollGoblinDrop, rollChestLoot,
  getAdjacentOpenTile, spawnLootPile, spawnLootPileAt
};
