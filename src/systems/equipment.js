/*
 Depthbound — src/systems/equipment.js
 Purpose: Equipment manager for 22 slots with validation & conflict rules.
 Dependencies: none (pure logic). Integrates with inventory UI when wired.
 Data contracts:
  - Slot IDs (22): weapon_main, weapon_off, two_handed, ranged, quiver,
    head, face, neck, shoulders, chest, back, arms, wrists, hands, waist,
    legs, feet, ring_1, ring_2, trinket_1, trinket_2, charm
  - Item equip shape: { equip: { slots: [slot_id], two_handed?: boolean, tags?: [] } }
 Touched systems: stats (mods aggregation), UI character sheet/inventory (future).
*/
export const SLOT_IDS = [
  'weapon_main','weapon_off','two_handed','ranged','quiver',
  'head','face','neck','shoulders','chest','back','arms','wrists','hands','waist',
  'legs','feet','ring_1','ring_2','trinket_1','trinket_2','charm'
];

export function emptyLoadout(){
  const m = {}; for (const id of SLOT_IDS) m[id] = null; return m;
}

export function canEquip(item, slot, loadout){
  if (!item?.equip) return false;
  const allowed = new Set(item.equip.slots || []);
  if (!allowed.has(slot)) return false;
  if (slot === 'two_handed' && !item.equip.two_handed) return false;
  if (item.equip.two_handed && (loadout.weapon_main || loadout.weapon_off)) return false;
  if ((slot === 'weapon_main' || slot === 'weapon_off') && loadout.two_handed) return false;
  return true;
}

export function equip(loadout, item, slot){
  if (!canEquip(item, slot, loadout)) return { ok:false, reason:'illegal' };
  const next = { ...loadout };
  if (item.equip.two_handed) {
    next.two_handed = item;
    next.weapon_main = null;
    next.weapon_off = null;
  } else {
    if (slot === 'weapon_main' || slot === 'weapon_off') next.two_handed = null;
    next[slot] = item;
  }
  return { ok:true, loadout: next };
}

export function unequip(loadout, slot){
  const next = { ...loadout };
  next[slot] = null;
  return { ok:true, loadout: next };
}

export function aggregateMods(loadout){
  const mods = [];
  for (const id of SLOT_IDS) {
    const it = loadout[id];
    if (it?.mods) mods.push(...it.mods);
  }
  return mods;
}
