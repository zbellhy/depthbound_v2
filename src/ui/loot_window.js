/* Depthbound — src/ui/loot_window.js
   Purpose: Loot window for chest/goblin drops — robust ESC + chest persistence + returns remaining list
*/
import { consumeEscapeFor, enterUi, exitUi } from './ui_state.js';

function addToInventory(state, itemId, qty=1){
  const inv = state.run?.inventory || (state.run.inventory = []);
  const idx = inv.findIndex(e=> e.id===itemId);
  if (idx>=0){ inv[idx].qty = (inv[idx].qty||1)+qty; } else { inv.push({ id:itemId, qty:qty }); }
}

/** Open loot and resolve with the **remaining** items when closed. */
export function openLootWindow(state, items, options={}){
  const overlay = document.getElementById('modal');
  const inner = document.getElementById('modal-inner');
  const list = Array.isArray(items) ? items.map(e=>({ id:e.id, qty:e.qty||1 })) : [];
  const autoClose = !!options.autoCloseOnEmpty;

  return new Promise((resolve)=>{
    function render(){
      inner.innerHTML = `
        <div style="min-width:420px; max-width:90vw;">
          <div style="display:flex; justify-content:center; gap:12px; align-items:baseline;">
            <div style="font-weight:800; font-size:20px;">${options.title || 'Loot'}</div>
          </div>
          <div style="height:1px; background:rgba(255,255,255,0.08); margin:10px 0 14px;"></div>
          <div id="loot-list" class="small" style="display:flex; flex-direction:column; gap:8px;">
            ${list.length ? list.map(entry => {
                const name = entry.id;
                const qty = entry.qty||1;
                return `<div class="loot-row" data-id="${entry.id}" style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                  <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</div>
                  <div style="opacity:0.85; width:40px; text-align:right;">x${qty}</div>
                  <span class="button small btn-take" data-id="${entry.id}">Take</span>
                </div>`;
              }).join('') : `<div class="small" style="opacity:0.8;">Nothing here.</div>`}
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:14px; gap:8px;">
            ${list.length ? `<span class="button" id="btn-take-all">Take All</span>` : ''}
            <span class="button" id="btn-close-loot">Close</span>
          </div>
        </div>
      `;

      const takeAll = inner.querySelector('#btn-take-all');
      if (takeAll){
        takeAll.onclick = ()=>{
          for (const e of list){ addToInventory(state, e.id, e.qty||1); }
          list.length = 0;
          if (autoClose){ close(false); } else { render(); }
        };
      }
      inner.querySelectorAll('.btn-take').forEach(btn=>{
        btn.onclick = ()=>{
          const id = btn.getAttribute('data-id');
          const i = list.findIndex(e=> e.id===id);
          if (i>=0){
            addToInventory(state, id, list[i].qty||1);
            list.splice(i,1);
            if (autoClose && list.length===0){ close(false); } else { render(); }
          }
        };
      });
      inner.querySelector('#btn-close-loot').onclick = ()=> close(false);
    }

    function onEsc(e){
      if (e.code==='Escape'){
        e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        close(true);
      }
    }
    document.addEventListener('keydown', onEsc, true);

    // Open
    overlay.classList.remove('hidden');
    enterUi();
    render();

    function close(viaEsc){
      document.removeEventListener('keydown', onEsc, true);
      exitUi();
      if (viaEsc){
        try{ state.input?.swallowEscapeEdge(); }catch(e){}
        try{ window.DB_ESC_SUPPRESS_UNTIL = Math.max(window.DB_ESC_SUPPRESS_UNTIL||0, Date.now()+260); }catch(e){}
        consumeEscapeFor(260);
      }
      overlay.classList.add('hidden');
      // Resolve with remaining items (array), even if empty.
      resolve(list.slice());
    }
  });
}
