/* Depthbound — src/systems/spawn.js
   Purpose: Deterministic, well-spaced spawn point selection on valid floor tiles
   Dependencies: tile.js
   Data contracts: pickFloorSpawns(map, rng, opts) -> [{x,y}...]
   Touched systems: scenes that spawn entities
*/
// [Context:] Used by scenes/caves.js to place enemies without clustering or invalid tiles
import { TILE } from '../game/tile.js';

/**
 * @param {GameMap} map
 * @param {function} rng - seeded RNG in [0,1)
 * @param {Object} opts
 * @param {number} opts.minCount
 * @param {number} opts.maxCount
 * @param {{x:number,y:number}} opts.avoid - center to avoid (e.g., player start)
 * @param {number} opts.minDist - minimum Chebyshev distance from avoid
 * @param {number} opts.minSep - minimum Chebyshev separation between spawns
 * @returns {{x:number,y:number, idx:number}[]}
 */
export function pickFloorSpawns(map, rng, opts){
  const {
    minCount=10, maxCount=18,
    avoid={x:0,y:0},
    minDist=8,
    minSep=4
  } = opts || {};

  // Build candidate list of bare floor tiles (no doors/exits/chests)
  const cands = [];
  for (let y=0;y<map.height;y++){
    for (let x=0;x<map.width;x++){
      const t = map.get(x,y);
      if (t !== TILE.FLOOR) continue;
      // distance from avoid
      const dx = Math.abs(x-avoid.x), dy = Math.abs(y-avoid.y);
      const cheb = Math.max(dx,dy);
      if (cheb < minDist) continue;
      cands.push({x,y, idx: map.idx(x,y)});
    }
  }
  // Fisher-Yates shuffle using rng
  for (let i=cands.length-1;i>0;i--){
    const j = Math.floor(rng()* (i+1));
    const tmp = cands[i]; cands[i] = cands[j]; cands[j] = tmp;
  }

  const want = Math.max(minCount, Math.min(maxCount, Math.floor(minCount + rng()*(maxCount-minCount+1))));
  const picked = [];
  for (const c of cands){
    if (picked.length >= want) break;
    let ok = true;
    for (const p of picked){
      const dx = Math.abs(c.x-p.x), dy = Math.abs(c.y-p.y);
      const cheb = Math.max(dx,dy);
      if (cheb < minSep){ ok = false; break; }
    }
    if (!ok) continue;
    picked.push(c);
  }
  return picked;
}
