/* Depthbound — src/core/state.js
   Purpose: Authoritative game state container
   Dependencies: rng.js
   Data contracts: {seed, rng, map, player, discovered}
   Touched systems: scenes, movement, FOV, save
*/
import { mulberry32 } from './rng.js';

export class GameState{
  constructor({ version, input, overlays }){
    this.version = version;
    this.input = input;
    this.overlays = overlays;
    this.seed = 'S00-abyssal-seed-0001';
    this.rng = mulberry32(this.hashSeed(this.seed));
    this.sceneManager = null;
    this.player = null;
    this.map = null;
    this.discovered = new Set(); // indexes
    this.visible = new Set();    // indexes (frame)
    this.fovRadius = 8;
    this.fps = 0;
  }
  hashSeed(s){
    let h=1779033703^s.length;
    for (let i=0;i<s.length;i++){
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h<<13) | (h>>>19);
    }
    return (h>>>0);
  }
  setSeed(str){
    this.seed = str;
    this.rng = mulberry32(this.hashSeed(str));
  }
}
