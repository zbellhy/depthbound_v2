/* Depthbound — src/game/entities/loot.js
   Purpose: Map entity representing a loot pile
   Dependencies: none
   Data contracts: {type:'loot', ch:'*', itemId, qty}
   Touched systems: render, interaction
*/
export class Loot{
  constructor({x,y,itemId,qty=1}){
    this.x=x; this.y=y;
    this.itemId=itemId; this.qty=qty;
    this.ch='*';
    this.type='loot';
  }
}
