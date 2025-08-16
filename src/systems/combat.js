/* Depthbound — src/systems/combat.js (v0.4.11)
   Purpose: Public combat entrypoint
   Dependencies: game/scenes/combat.js
   Data contracts: startDuel(scene, state, enemy)
   Touched systems: Caves -> pushes CombatScene
*/
import { CombatScene } from '../game/scenes/combat.js';

/** Start a turn-based combat scene on top of the stack. */
export function startDuel(scene, state, enemy){
  const sm = state.sceneManager;
  if (!sm) { console.warn('No SceneManager on state; cannot start combat'); return; }
  sm.push(new CombatScene({ state, prev: scene, enemy }));
}

export default { startDuel };
