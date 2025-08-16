/* Depthbound — src/systems/status_effects.js (v0.4.12)
   Purpose: Lightweight status-effect engine (bleed/poison/stun) with per-turn ticks
   Dependencies: none (fetches data/effects.json at runtime; has internal fallback)
   Public API:
     - loadEffects(), getEffectMap()
     - ensureActorEffects(actor), applyEffect(state, target, id, opts), hasEffect(actor,id), clearEffect(actor,id)
     - tickEffects(state, actor) -> { total, entries:[{id,dmg}], removed:[id] }
     - renderEffectText(actor) -> string like '滴x2(2) ☠(1)'
     - procOnHit(state, attacker, defender) -> applies effects based on simple mapping
*/
let __defs = null, __map = null;

const FALLBACK = {
  schema_version: 1,
  effects: [
    { id: 'bleed',  name:'Bleed',  kind:'dot',  per_turn:'1..2', max_stacks:3, icon:'滴' },
    { id: 'poison', name:'Poison', kind:'dot',  per_turn:'1..2', max_stacks:5, icon:'☠' },
    { id: 'stun',   name:'Stun',   kind:'stun', turns:1,          icon:'✶' },
  ]
};

export async function loadEffects(){
  if (__defs) return __defs;
  try{
    const res = await fetch('data/effects.json', { cache:'no-store' });
    __defs = await res.json();
  } catch(_){
    __defs = FALLBACK;
  }
  __map = new Map((__defs.effects||[]).map(e => [e.id, e]));
  return __defs;
}
function effectDef(id){
  if (!__map){
    __defs = FALLBACK;
    __map = new Map((__defs.effects||[]).map(e => [e.id, e]));
  }
  return __map.get(id);
}

export function getEffectMap(){ if (!__map) loadEffects(); return __map; }

export function ensureActorEffects(actor){
  if (!actor.effects) actor.effects = [];
  return actor.effects;
}

export function hasEffect(actor, id){
  const list = actor.effects || [];
  return list.some(e => e.id === id && e.turns > 0);
}

export function clearEffect(actor, id){
  if (!actor.effects) return;
  actor.effects = actor.effects.filter(e => e.id !== id);
}

function parseRange(x){
  if (typeof x === 'number') return { min:x, max:x };
  if (typeof x === 'string'){
    const m = x.match(/^(\d+)\.\.(\d+)$/);
    if (m) return { min: parseInt(m[1],10), max: parseInt(m[2],10) };
    const v = parseInt(x,10);
    if (!isNaN(v)) return { min:v, max:v };
  }
  return { min:1, max:1 };
}

function rollInRange(state, r){
  const rng = (state && state.rng) ? state.rng : Math.random;
  const n = Math.floor(rng() * (r.max - r.min + 1)) + r.min;
  return Math.max(r.min, Math.min(r.max, n));
}

export function applyEffect(state, target, id, opts={}){
  const def = effectDef(id);
  if (!def) return null;
  const list = ensureActorEffects(target);
  const existing = list.find(e => e.id === id);
  const maxStacks = def.max_stacks || 1;
  if (existing){
    existing.stacks = Math.max(1, Math.min(maxStacks, (existing.stacks||1) + (opts.stacks||1)));
    const addTurns = Number.isFinite(opts.turns) ? opts.turns : (def.turns || 2);
    existing.turns = Math.max(existing.turns, addTurns);
    if (opts.potency) existing.potency = opts.potency;
    return existing;
  } else {
    const turns = Number.isFinite(opts.turns) ? opts.turns : (def.turns || 2);
    const potency = opts.potency || def.per_turn || def.turns || 1;
    const inst = { id, turns, stacks: Math.max(1, Math.min(maxStacks, opts.stacks||1)), potency };
    list.push(inst);
    return inst;
  }
}

export function tickEffects(state, actor){
  const list = ensureActorEffects(actor);
  let total = 0;
  const entries = [];
  const removed = [];
  for (const e of list){
    const def = effectDef(e.id) || {};
    if (def.kind === 'dot'){
      const r = parseRange(e.potency || def.per_turn || 1);
      const one = rollInRange(state, r) * Math.max(1, e.stacks||1);
      actor.hp = Math.max(0, (actor.hp|0) - one);
      total += one;
      entries.push({ id:e.id, dmg: one });
    }
    // decrement turns after effect
    e.turns = Math.max(0, (e.turns|0) - 1);
    if (e.turns <= 0) removed.push(e.id);
  }
  if (removed.length){
    actor.effects = actor.effects.filter(e => e.turns > 0);
  }
  return { total, entries, removed };
}

export function renderEffectText(actor){
  const list = actor.effects || [];
  if (!list.length) return '';
  const parts = [];
  for (const e of list){
    const def = effectDef(e.id) || {};
    const icon = def.icon || e.id[0].toUpperCase();
    const stack = e.stacks && e.stacks>1 ? `x${e.stacks}` : '';
    parts.push(`${icon}${stack}(${e.turns})`);
  }
  return parts.join('  ');
}

/** Simple proc mapping for this sprint (no items.json changes) */
export function procOnHit(state, attacker, defender){
  // Goblin or generic enemy small chance to inflict bleed
  if (attacker && attacker.type === 'enemy'){
    const rng = state.rng || Math.random;
    if (rng() < 0.10){ applyEffect(state, defender, 'bleed', { turns: 1, potency:'1..2' }); }
    return;
  }
  // Player weapon-based proc
  const eq = state.run?.equipped || {};
  const main = eq.main_hand || null;
  if (!main) return;
  if (main === 'rusted_dagger' || /dagger/.test(main)){
    const rng = state.rng || Math.random;
    if (rng() < 0.20){ applyEffect(state, defender, 'bleed', { turns: 2, potency:'1..2' }); }
  }
}
