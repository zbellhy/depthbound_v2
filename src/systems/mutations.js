/*
 Depthbound — src/systems/mutations.js
 Purpose: Manage 8 mutation sockets and produce stat mods to feed stats.computeStats.
 Dependencies: none. Reads mutation definitions (data/mutations.json) at runtime if provided by caller.
 Data contracts:
  - Mutation def: { id, name, mods: [{stat,op,value}, ...] }
  - State shape: { slots: number, equipped: string[] } where equipped holds mutation IDs
 Touched systems: stats aggregation, character sheet UI (future).
*/
export function emptyMutationState(slots=8){ return { slots, equipped: [] }; }

export function equipMutation(state, id){
  if (state.equipped.includes(id)) return state;
  if (state.equipped.length >= state.slots) return state;
  return { ...state, equipped: [...state.equipped, id] };
}

export function unequipMutation(state, id){
  return { ...state, equipped: state.equipped.filter(x => x !== id) };
}

export function aggregateMutationMods(state, defsById){
  const mods = [];
  for (const id of state.equipped) {
    const def = defsById[id];
    if (def?.mods) mods.push(...def.mods);
  }
  return mods;
}
