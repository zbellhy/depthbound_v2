/* Depthbound — src/core/rng.js
   Purpose: Deterministic RNG (mulberry32)
   Dependencies: none
   Data contracts: seed:number -> function() -> [0,1)
   Touched systems: worldgen, combat, placement
*/
export function mulberry32(a){
  return function(){
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t>>>15, t | 1);
    t ^= t + Math.imul(t ^ t>>>7, t | 61);
    return ((t ^ t>>>14) >>> 0) / 4294967296;
  };
}
