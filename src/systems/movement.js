/* Depthbound — src/systems/movement.js
   Purpose: Player/Entity movement with collision
   Dependencies: none
   Data contracts: moveEntity(map, entity, dx,dy) -> bool
   Touched systems: scenes, combat trigger
*/
export function moveEntity(state, entity, dx, dy){
  const m = state.map;
  const nx = entity.x + dx, ny = entity.y + dy;
  if (!m.inBounds(nx,ny) || m.isBlocked(nx,ny)) return false;
  m.clearEntity(entity);
  entity.x = nx; entity.y = ny;
  m.setEntity(entity);
  return true;
}
