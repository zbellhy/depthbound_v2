/* Depthbound — src/game/entities/player.js
   Purpose: Player entity & helpers
   Dependencies: entity.js
   Data contracts: stats minimal for Sprint‑00
   Touched systems: movement, combat
*/
import { Entity } from './entity.js';
export class Player extends Entity{
  constructor(opts={}){
    super({ ch:'@', name:'You', hp:12, pow:2, ...opts });
  }
}
