/* Depthbound — src/ui/inventory.js
   Purpose: Inventory — 5x4 grid; equip/use; robust ESC
   Change v0.3.38: also toggle state.uiActive/uiBlockFrames and set window.DB_ESC_SUPPRESS_UNTIL
*/
import { loadItems, getItemMap } from '../systems/loot.js';
import { consumeEscapeFor, enterUi, exitUi } from './ui_state.js';

export async function ensureItems(state){
  if (state.itemsById) return;
  const db = await loadItems();
  state.itemsDb = db;
  state.itemsById = getItemMap(db);
}

export async function openInventory(state){
  await ensureItems(state);
  const overlay = document.getElementById('modal');
  const inner = document.getElementById('modal-inner');
  state.uiActive = true;

  const run = state.run || (state.run={ inventory:[], equipped:{} });
  const eq = run.equipped || (run.equipped={ head:null, body:null, main_hand:null, off_hand:null, trinket:null });
  const gold = (state.profile && typeof state.profile.gold==='number') ? state.profile.gold : 0;

  // Layout sizing (5x4 + 260 sidebar)
  const COLS = 5, ROWS_VISIBLE = 4, SLOT_W = 96, SLOT_H = 64, GAP = 12;
  const GRID_W = COLS*SLOT_W + (COLS-1)*GAP, GRID_H_VISIBLE = ROWS_VISIBLE*SLOT_H + (ROWS_VISIBLE-1)*GAP;
  const GRID_PAD = 12, LEFT_BOX_W = GRID_W + GRID_PAD*2;
  const RIGHT_SIDEBAR_W = 260, COL_GAP = 20;
  const CONTENT_W = LEFT_BOX_W + RIGHT_SIDEBAR_W + COL_GAP;
  const PANEL_PAD = 16, PANEL_W = CONTENT_W + PANEL_PAD*2;

  const prev = {
    width: inner.style.width, maxWidth: inner.style.maxWidth, padding: inner.style.padding,
    boxSizing: inner.style.boxSizing, position: inner.style.position, top: inner.style.top,
    left: inner.style.left, transform: inner.style.transform, maxHeight: inner.style.maxHeight,
    overflowX: inner.style.overflowX, overflowY: inner.style.overflowY, margin: inner.style.margin,
    classWide: inner.classList.contains('modal-wide')
  };
  inner.dataset.invPrev = JSON.stringify(prev);
  const vh = Math.max(document.documentElement.clientHeight||0, window.innerHeight||0);
  inner.classList.add('modal-wide');
  inner.style.boxSizing = 'border-box';
  inner.style.padding = PANEL_PAD + 'px';
  inner.style.maxWidth = 'none';
  inner.style.width = PANEL_W + 'px';
  inner.style.maxHeight = Math.min(680, Math.floor(vh*0.92)) + 'px';
  inner.style.overflowX = 'hidden';
  inner.style.overflowY = 'auto';
  inner.style.position = 'fixed';
  inner.style.top = '50%';
  inner.style.left = '50%';
  inner.style.transform = 'translate(-50%, -50%)';
  inner.style.margin = '0';

  inner.innerHTML = `
    <div id="inv-root" style="width:${CONTENT_W}px; margin:0 auto;">
      <div style="display:flex; justify-content:center; align-items:baseline; gap:14px;">
        <div style="font-weight:800; font-size:20px;">Inventory</div>
        <div class="small">Gold: ${gold}</div>
      </div>
      <div class="small" style="text-align:center; opacity:0.9; margin-top:2px;">Enter: equip/use · X: drop · Esc: close</div>
      <div style="height:1px; background:rgba(255,255,255,0.08); margin:10px 0 14px;"></div>

      <div style="display:grid; grid-template-columns: ${LEFT_BOX_W}px ${RIGHT_SIDEBAR_W}px; gap:${COL_GAP}px;">
        <div style="border:1px solid rgba(255,255,255,0.08); border-radius:12px; background:rgba(17,24,39,0.45); width:${LEFT_BOX_W}px;">
          <div id="inv-grid"
               style="padding:${GRID_PAD}px; max-height:${GRID_H_VISIBLE + GRID_PAD*2}px; overflow:auto;
                      display:grid; grid-template-columns: repeat(${COLS}, ${SLOT_W}px);
                      grid-auto-rows: ${SLOT_H}px; gap:${GAP}px; justify-content:start;">
            ${renderBackpack(run.inventory, state)}
          </div>
        </div>
        <div style="width:${RIGHT_SIDEBAR_W}px;">
          <div style="font-weight:700; margin-bottom:8px;">Equipped</div>
          <div id="eq-list">${renderEquipList(eq, state, RIGHT_SIDEBAR_W)}</div>
          <div style="height:1px; background:rgba(255,255,255,0.08); margin:10px 0 10px;"></div>
          <div class="small" id="inv-stats" style="opacity:0.85;">Stats: ATK 0 · DEF 0 · HP 0</div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:14px;">
        <span class="button" id="btn-close-inv">Close</span>
      </div>
    </div>
  `;

  function onEsc(e){
    if (e.code==='Escape'){
      e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      close(true);
    }
  }
  document.addEventListener('keydown', onEsc, true);
  overlay.classList.remove('hidden');
  enterUi();
  inner.querySelector('#btn-close-inv').onclick = ()=> close(false);
  bindBackpackClicks(); bindEquipClicks();

  function bindBackpackClicks(){
    inner.querySelectorAll('.inv-slot[data-item-id]').forEach(el=>{
      el.addEventListener('click', ()=>{ const id = el.getAttribute('data-item-id'); handleBackpackClick(id); });
    });
  }
  function bindEquipClicks(){
    inner.querySelectorAll('.eq-unequip[data-slot]').forEach(el=>{
      el.addEventListener('click', ()=>{ const slot = el.getAttribute('data-slot'); unequipToBackpack(state, slot); refreshPanels(); });
    });
  }
  function refreshPanels(){
    inner.querySelector('#inv-grid').innerHTML = renderBackpack(run.inventory, state);
    inner.querySelector('#eq-list').innerHTML = renderEquipList(eq, state, RIGHT_SIDEBAR_W);
    bindBackpackClicks(); bindEquipClicks();
  }

  function close(viaEsc){
    document.removeEventListener('keydown', onEsc, true);
    exitUi();
    state.uiActive = false;
    state.uiBlockFrames = Math.max(2, state.uiBlockFrames|0);
    if (viaEsc){
      try{ state.input?.swallowEscapeEdge(); }catch(e){}
      const until = Date.now()+260; try{ window.DB_ESC_SUPPRESS_UNTIL = Math.max(window.DB_ESC_SUPPRESS_UNTIL||0, until); }catch(e){}
      consumeEscapeFor(260);
    }
    try{
      const p = JSON.parse(inner.dataset.invPrev || '{}');
      inner.style.width = p.width || ''; inner.style.maxWidth = p.maxWidth || ''; inner.style.padding = p.padding || '';
      inner.style.boxSizing = p.boxSizing || ''; inner.style.position = p.position || ''; inner.style.top = p.top || '';
      inner.style.left = p.left || ''; inner.style.transform = p.transform || ''; inner.style.maxHeight = p.maxHeight || '';
      inner.style.overflowX = p.overflowX || ''; inner.style.overflowY = p.overflowY || ''; inner.style.margin = p.margin || '';
      if (!p.classWide) inner.classList.remove('modal-wide');
    }catch(e){ inner.classList.remove('modal-wide'); }
    overlay.classList.add('hidden');
  }

  function handleBackpackClick(itemId){
    const it = state.itemsById?.get(itemId); if (!it) return;
    const slot = getItemSlot(it);
    if (slot){ equipFromInventory(state, itemId, slot); refreshPanels(); }
    else if (isConsumable(it)){ consumeItem(state, itemId, 1); refreshPanels(); }
  }
}

// Helpers (unchanged from prior version)
function addToInventory(state, itemId, qty=1){
  const inv = state.run.inventory;
  const idx = inv.findIndex(e=> e.id===itemId);
  if (idx>=0){ inv[idx].qty = (inv[idx].qty||1)+qty; } else { inv.push({ id:itemId, qty }); }
}
function removeOneFromInventory(state, itemId){
  const inv = state.run.inventory; const i = inv.findIndex(e=> e.id===itemId);
  if (i>=0){ const q=inv[i].qty||1; if (q>1) inv[i].qty=q-1; else inv.splice(i,1); return true; } return false;
}
function equipFromInventory(state, itemId, slot){
  const eq = state.run.equipped || (state.run.equipped={});
  if (!removeOneFromInventory(state, itemId)) return false;
  if (eq[slot]) addToInventory(state, eq[slot], 1);
  eq[slot] = itemId; return true;
}
function unequipToBackpack(state, slot){
  const eq = state.run.equipped||{}; if (!eq[slot]) return false;
  addToInventory(state, eq[slot], 1); eq[slot]=null; return true;
}
function consumeItem(state, itemId, qty=1){ for (let i=0;i<qty;i++){ if (!removeOneFromInventory(state, itemId)) break; } return true; }
function getItemSlot(it){
  if (!it) return 'misc';
  if (it?.slot) return it.slot;
  const tags=it.tags||[], type=(it.type||'').toLowerCase(), name=(it.name||'').toLowerCase();
  if (tags.includes('head') || type==='helmet' || /helm|hat|hood/.test(name)) return 'head';
  if (tags.includes('body') || type==='armor' || /armor|mail|robe|coat|plate|tunic/.test(name)) return 'body';
  if (tags.includes('trinket') || type==='trinket' || /ring|amulet|charm|talisman/.test(name)) return 'trinket';
  if (tags.includes('weapon') || type==='weapon' || /sword|axe|mace|dagger|bow|staff|wand|club/.test(name)) return 'main_hand';
  if (tags.includes('offhand') || type==='offhand' || /shield|buckler|targe/.test(name)) return 'off_hand';
  return null;
}
function isConsumable(it){
  const tags=it.tags||[], type=(it.type||'').toLowerCase(), cat=(it.category||'').toLowerCase(), name=(it.name||'').toLowerCase();
  return it.consumable===true || tags.includes('potion') || type==='potion' || cat==='potion' || /potion|elixir|draught|tonic/.test(name);
}
function slot(content=''){
  return `<div class="inv-slot" style="width:96px; height:64px; background:rgba(17,24,39,0.55);
                border:1px solid rgba(255,255,255,0.08); border-radius:12px;
                display:flex; align-items:center; justify-content:center; position:relative; cursor:pointer;">${content||''}</div>`;
}
function renderBackpack(inv, state){
  const items = Array.isArray(inv) ? inv.slice() : []; const minSlots = 20;
  const list = items.length >= minSlots ? items : items.concat(new Array(minSlots - items.length).fill({ placeholder:true }));
  return list.map(entry=>{
    if (entry && !entry.placeholder){
      const it = state.itemsById?.get(entry.id); const letter=((it&&it.name)?it.name[0]:'?').toUpperCase(); const qty=entry.qty||1;
      const content = `<div title="${it?.name||'Item'}" style="width:32px; height:32px; border-radius:8px;
             background:rgba(55,65,81,0.7); display:flex; align-items:center; justify-content:center; font-weight:700;">${letter}</div>
        ${qty>1 ? `<div class="small" style="position:absolute; right:6px; bottom:4px; padding:1px 6px; border-radius:6px; background:rgba(0,0,0,0.45);">${qty}</div>` : ''}
        <div class="small" style="position:absolute; left:6px; top:6px; opacity:0.7;">${slotAbbrev(getItemSlot(it))}</div>`;
      return `<div class="inv-slot" data-item-id="${entry.id}">${slot(content)}</div>`;
    } else { return `<div class="inv-slot">${slot('')}</div>`; }
  }).join('');
}
function slotAbbrev(s){ return s==='head'?'H':s==='body'?'B':s==='main_hand'?'M':s==='off_hand'?'O':s==='trinket'?'T':''; }
function renderEquipList(eq, state, w){
  const rows = [['head',eq.head],['body',eq.body],['main_hand',eq.main_hand],['off_hand',eq.off_hand],['trinket',eq.trinket]];
  return rows.map(([label,id])=>{
    const it = (id && state.itemsById) ? state.itemsById.get(id) : null; const val = it?.name || 'empty';
    return `<div style="display:flex; align-items:center; gap:10px; margin:6px 0;">
      <div style="display:flex; gap:10px; align-items:center; flex:1; min-width:0;">
        <div style="width:110px;" class="small"><b>${label}:</b></div>
        <div class="small" style="opacity:0.9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0;">${val}</div>
      </div>
      ${id ? `<span class="button small eq-unequip" data-slot="${label}" style="flex:0 0 auto;">Unequip</span>` : ''}
    </div>`;
  }).join('');
}
