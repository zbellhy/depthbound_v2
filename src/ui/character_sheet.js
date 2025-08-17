/*
 Depthbound — src/ui/character_sheet.js (v0.5.4)
 Purpose: Render the Character Sheet modal; can **force**-open even if another UI is active.
*/
import { enterUi, exitUi, consumeEscapeFor, isUiActive } from './ui_state.js';
import input from '../core/input.js';
import { FLAGS } from '../core/feature_flags.js';

const SLOT_IDS = [
  'weapon_main','weapon_off','two_handed','ranged','quiver',
  'head','face','neck','shoulders','chest','back','arms','wrists','hands','waist',
  'legs','feet','ring_1','ring_2','trinket_1','trinket_2','charm'
];

function byId(id){ return /** @type {HTMLElement} */(document.getElementById(id)); }

function ensureModalElements(){
  const modal = byId('modal');
  if (!modal) throw new Error('#modal not found');
  const inner = byId('modal-inner') || (() => {
    const m = document.getElementById('modal');
    const div = document.createElement('div');
    div.id = 'modal-inner';
    m.appendChild(div);
    return div;
  })();
  return { modal, inner };
}

function ensureStyles(){
  if (document.getElementById('char-sheet-styles')) return;
  const css = `
  .char-sheet { display: grid; gap: 16px; }
  .char-sheet .cs-header { display:flex; align-items:center; justify-content:space-between; }
  .char-sheet .cs-header h2 { margin:0; font-size: 20px; }
  .char-sheet .cs-hint { opacity: 0.7; font-size: 12px; }
  .char-sheet .cs-content { display:grid; gap:16px; }
  .char-sheet .cs-panel h3 { margin: 0 0 8px 0; font-size: 16px; }
  .equip-board { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap:8px; }
  .equip-board .slot { border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:8px; min-height:64px; display:grid; gap:6px; }
  .equip-board .slot span { opacity:0.8; font-size:12px; }
  .slot-empty { opacity:0.6; font-size:12px; }
  .mutations-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap:8px; }
  .mutations-grid .mut-slot { border:1px dashed rgba(255,255,255,0.2); border-radius:12px; padding:8px; min-height:56px; display:grid; gap:6px; }
  .muted { opacity: 0.7; }`;
  const el = document.createElement('style');
  el.id = 'char-sheet-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

let _escHandler = null;
let _open = false;

export function openCharacterSheet(opts={}){
  const force = !!opts.force;
  if (!FLAGS.CHAR_SHEET_ENABLED) return;

  const { modal, inner } = ensureModalElements();
  ensureStyles();

  if (isUiActive()) {
    if (!force) return;
    // Gracefully exit whatever UI just claimed the latch in the same tick
    try { exitUi(); } catch {}
    inner.classList.remove('modal-wide');
    modal.classList.add('hidden');
    inner.setAttribute('aria-hidden', 'true');
  }

  // Now claim the UI for the sheet
  try { enterUi(); } catch {}
  _open = true;

  modal.classList.remove('hidden');
  inner.classList.add('modal-wide');
  inner.setAttribute('aria-hidden', 'false');
  inner.innerHTML = renderSheetHtml();

  _escHandler = (ev) => {
    if (ev.key === 'Escape'){
      ev.preventDefault();
      ev.stopPropagation();
      closeCharacterSheet();
    }
  };
  document.addEventListener('keydown', _escHandler, true);
}

export function closeCharacterSheet(){
  const { modal, inner } = ensureModalElements();
  if (!_open) return;
  _open = false;
  try { input.swallowEscapeEdge?.(); } catch {}
  try { consumeEscapeFor(260); } catch {}
  try { exitUi(); } catch {}
  document.removeEventListener('keydown', _escHandler, true);
  _escHandler = null;
  inner.classList.remove('modal-wide');
  modal.classList.add('hidden');
  inner.setAttribute('aria-hidden', 'true');
}

function renderSheetHtml(){
  return `
    <div id="char-sheet" class="char-sheet">
      <div class="cs-header">
        <h2>Character Sheet</h2>
        <div class="cs-hint">Press Esc to close</div>
      </div>
      <div class="cs-content">
        <section class="cs-panel">
          <h3>Equipment</h3>
          <div class="equip-board">
            ${SLOT_IDS.map(id => `<div class="slot" data-slot="${id}"><span>${id.replace(/_/g,' ')}</span><div class="slot-empty">empty</div></div>`).join('')}
          </div>
        </section>
        <section class="cs-panel">
          <h3>Mutations (8)</h3>
          <div class="mutations-grid">
            ${Array.from({length:8}).map((_,i)=>`<div class="mut-slot" data-mut="${i+1}"><span>slot ${i+1}</span><div class="slot-empty">empty</div></div>`).join('')}
          </div>
        </section>
        <section class="cs-panel">
          <h3>Stats (preview)</h3>
          <p class="muted">Stats pipeline will populate in the next patch.</p>
        </section>
      </div>
    </div>
  `;
}
