/* Depthbound — src/game/entities/enemy.js
   Purpose: Enemy entity
   Dependencies: entity.js
   Data contracts: minimal (hp/pow)
   Touched systems: combat
*/
import { Entity } from './entity.js';
export class Enemy extends Entity{
  constructor(opts={}){
    super({ ch:'g', name:'Goblin', hp:6, pow:1, ...opts });
  }
}
