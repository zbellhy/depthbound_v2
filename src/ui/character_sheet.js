/*
 Depthbound — src/ui/character_sheet.js
 Purpose: Render the Character Sheet modal (UI-only), showing 22 equipment slots and 8 mutation sockets.
 Dependencies:
   - UI latches: enterUi, exitUi, isUiActive, consumeEscapeFor from ./ui_state.js
   - Input singleton (swallowEscapeEdge) from ../core/input.js
   - Feature flags from ../core/feature_flags.js
 Contracts:
   - Uses existing #modal and #modal-inner containers.
   - Applies .modal-wide to prevent overflow.
 Touched systems: none (display only). No changes to inventory/equipment logic.
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

let _escHandler = null;
let _open = false;

export function openCharacterSheet(){
  if (!FLAGS.CHAR_SHEET_ENABLED) return;
  if (isUiActive()) return; // respect existing UI
  const { modal, inner } = ensureModalElements();

  // enter UI + prepare DOM
  enterUi();
  _open = true;

  modal.classList.remove('hidden');
  inner.classList.add('modal-wide');
  inner.setAttribute('aria-hidden', 'false');

  // Render contents
  inner.innerHTML = renderSheetHtml();

  // Capture-phase Esc
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

  // UI latches and edges
  try { input.swallowEscapeEdge?.(); } catch {}
  try { consumeEscapeFor(260); } catch {}
  try { exitUi(); } catch {}

  document.removeEventListener('keydown', _escHandler, true);
  _escHandler = null;

  // Hide & cleanup
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
          <p class="muted">Stats pipeline is present but not wired to gameplay yet. This panel will populate when we connect player base, items, and mutations in the next patch.</p>
        </section>
      </div>
    </div>
  `;
}
