/* Depthbound — src/systems/interaction.js (v0.4.10)
   Purpose: E-key interactions: doors, chests (delegated), exits
   Dependencies: tile.js
   Data contracts: tryInteract(state) -> boolean (acted)
   Touched systems: scenes
*/
import { TILE } from '../game/tile.js';

export function tryInteract(state){
  const { player, map } = state;
  const scene = state.sceneManager?.top();
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  for (const [dx,dy] of dirs){
    const x = player.x+dx, y = player.y+dy;
    if (!map.inBounds(x,y)) continue;

    const t = map.get(x,y);
    if (t?.door){
      const orientation = t.orientation || 'h';
      if (t.door.open){ map.set(x,y, { ...TILE.DOOR_CLOSED, orientation }); }
      else { map.set(x,y, { ...TILE.DOOR_OPEN, orientation }); }
      return true;
    }
    if (t === TILE.CHEST){
      if (scene?.handleChest){ scene.handleChest(x,y); return true; }
      scene?.openModal?.('<b>Chest</b><br/>You found nothing.');
      return true;
    }
    if (t === TILE.EXIT){ scene?.onExitToTown?.(); return true; }
  }
  return false;
}
