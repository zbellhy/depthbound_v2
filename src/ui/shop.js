/* Depthbound — src/ui/shop.js
   Purpose: Vendor shop modal with Buy/Sell tabs.
   Dependencies: ui_state.js (enterUi/exitUi/consumeEscapeFor), inventory ensureItems, loot.js (itemValue, add/remove), vendor_stock.js
   Data contracts:
     - state.itemsById: Map of itemId -> itemDef (loaded by ensureItems)
     - state.profile.gold: integer currency
     - state.run.inventory: [{ id, qty }]
     - CONFIG.economy: { buyMult:number, sellRate:number } (optional)
   Touched systems: UI lifecycle (enterUi/exitUi), Input latch (ESC), Inventory ops

   Notes:
   - Adds 'modal-wide' to .modal-inner on open to expand modal background for wide shop layouts.
   - Removes the class on close to avoid affecting other modals.
   - Capture-phase ESC with preventDefault/stopPropagation + state.input.swallowEscapeEdge() + consumeEscapeFor(260).
   - Rows hide at qty<=0 for vendor stock; sell rows hide when item qty hits 0.
*/
import { consumeEscapeFor, enterUi, exitUi } from './ui_state.js';
import { ensureItems } from './inventory.js';
import { itemValue, addToInventory, removeFromInventory } from '../systems/loot.js';
import { getVendorStock } from '../systems/vendor_stock.js';

export async function openShop(state, vendor = null){
  await ensureItems(state);

  const overlay = document.getElementById('modal');
  const inner = document.getElementById('modal-inner');
  const db = state.itemsById;
  const profile = (state.profile ||= { gold: 0 });
  const run = (state.run ||= { inventory:[], equipped:{} });
  const econ = (state.CONFIG && state.CONFIG.economy) || { buyMult: 1.0, sellRate: 0.4 };

  // Determine shop type from vendor param (string or object) — default 'general'
  const shopType = (typeof vendor === 'string') ? vendor
                   : (vendor && (vendor.shop || vendor.type || vendor.kind)) || 'general';

  // Clone stock so UI can mutate qty without affecting base
  const stock = getVendorStock(shopType).map(x => ({ ...x }));

  function priceBuy(def){ return Math.max(1, Math.floor(itemValue(def) * (econ.buyMult ?? 1.0))); }
  function priceSell(def){ return Math.max(0, Math.floor(itemValue(def) * (econ.sellRate ?? 0.4))); }

  // Build HTML
  function render(){
    const gold = Number(profile.gold|0);
    const buyRows = stock.filter(e=>e.qty>0).map(entry => {
      const def = db.get(entry.id); if (!def) return '';
      const price = priceBuy(def);
      return `<div class="row buy" data-id="${entry.id}" style="display:flex; align-items:center; gap:12px; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
          <div style="width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; background:#0f172a; border:1px solid #2b3649; font-weight:700;">${(def.name||'?')[0]?.toUpperCase()||'?'}</div>
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${def.name||entry.id}</div>
          <div style="opacity:0.7;">×${entry.qty}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="small" style="opacity:0.8;">${price}g</div>
          <button class="button buy-btn" data-id="${entry.id}">Buy</button>
        </div>
      </div>`;
    }).join('') || `<div class="small" style="opacity:0.7;">Sold out.</div>`;

    // Build sell rows from inventory
    const inv = run.inventory || [];
    const sellRows = inv.map((slot, idx) => {
      const def = db.get(slot.id); if (!def) return '';
      const price = priceSell(def);
      return `<div class="row sell" data-id="${slot.id}" data-idx="${idx}" style="display:flex; align-items:center; gap:12px; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
          <div style="width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; background:#0f172a; border:1px solid #2b3649; font-weight:700;">${(def.name||'?')[0]?.toUpperCase()||'?'}</div>
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${def.name||slot.id}</div>
          <div style="opacity:0.7;">×${slot.qty||1}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="small" style="opacity:0.8;">${price}g</div>
          <button class="button sell-btn" data-idx="${idx}">Sell</button>
        </div>
      </div>`;
    }).join('') || `<div class="small" style="opacity:0.7;">Nothing to sell.</div>`;

    inner.innerHTML = `
      <div style="min-width:720px; max-width:calc(min(95vw, 1000px));">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:12px;">
          <div style="font-weight:800; font-size:20px;">${shopType[0].toUpperCase()+shopType.slice(1)} Shop</div>
          <div class="small">Gold: <b>${gold}g</b></div>
        </div>
        <div style="height:1px; background:rgba(255,255,255,0.08); margin:10px 0 14px;"></div>
        <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
          <div style="flex:1 1 420px; min-width:360px;">
            <div class="small" style="font-weight:700; margin-bottom:8px;">Buy</div>
            <div id="buy-list" style="display:flex; flex-direction:column; gap:8px;">${buyRows}</div>
          </div>
          <div style="flex:1 1 420px; min-width:360px;">
            <div class="small" style="font-weight:700; margin-bottom:8px;">Sell</div>
            <div id="sell-list" style="display:flex; flex-direction:column; gap:8px;">${sellRows}</div>
          </div>
        </div>
        <div style="margin-top:14px; display:flex; justify-content:flex-end;">
          <button id="close-btn" class="button">Close</button>
        </div>
      </div>
    `;

    wireRowHandlers();
  }

  function wireRowHandlers(){
    // Buy buttons
    inner.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const entry = stock.find(e => e.id === id);
        const def = db.get(id);
        if (!entry || !def) return;
        const price = priceBuy(def);
        if ((profile.gold|0) < price) return; // not enough gold
        profile.gold = (profile.gold|0) - price;
        addToInventory(state, id, 1);
        entry.qty = Math.max(0, (entry.qty|0) - 1);
        render();
      }, { passive: true });
    });

    // Sell buttons
    inner.querySelectorAll('.sell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-idx')||'-1');
        const inv = run.inventory || [];
        if (idx < 0 || idx >= inv.length) return;
        const slot = inv[idx];
        const def = db.get(slot.id); if (!def) return;
        const price = priceSell(def);
        profile.gold = (profile.gold|0) + price;
        // remove one item from this inventory slot
        // We try to reuse removeFromInventory if it exists; otherwise manual
        try{
          removeFromInventory(state, idx, 1);
        }catch(_){
          if ((slot.qty||1) > 1){ slot.qty -= 1; } else { inv.splice(idx, 1); }
        }
        render();
      }, { passive: true });
    });

    // Close
    const closeBtn = inner.querySelector('#close-btn');
    if (closeBtn){
      closeBtn.addEventListener('click', () => close(false), { passive: true });
    }
  }

  function onEsc(e){
    if (e.code === 'Escape'){
      e.preventDefault();
      e.stopPropagation();
      close(true);
    }
  }

  function close(viaEsc){
    document.removeEventListener('keydown', onEsc, true);
    overlay.classList.add('hidden');
    // Clean 'modal-wide' class so other modals use default sizing
    try{ inner.classList.remove('modal-wide'); }catch(_){}
    state.uiActive = false;
    state.uiBlockFrames = Math.max(2, state.uiBlockFrames|0);
    exitUi();
    if (viaEsc){
      try{ state.input?.swallowEscapeEdge?.(); }catch(_){}
      consumeEscapeFor(260);
      try{ if (typeof window!=='undefined'){ window.DB_ESC_SUPPRESS_UNTIL = Math.max(window.DB_ESC_SUPPRESS_UNTIL||0, Date.now()+260); } }catch(_){}
    }
  }

  // ---- OPEN ----
  inner.classList.add('modal-wide'); // ensure wide container for shop content
  overlay.classList.remove('hidden');
  state.uiActive = true;
  enterUi();
  render();
  document.addEventListener('keydown', onEsc, true);
}
