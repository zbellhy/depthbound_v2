/* Depthbound — src/game/entities/vendor.js
   Purpose: Vendor NPC entity (opens shop)
   Dependencies: none
   Data contracts: {type:'vendor', shop:'general'|'arms'|'armor'}
   Touched systems: render, interaction, town
*/
export class Vendor{
  constructor({x,y,shop='general',name='Vendor'}){
    this.x=x; this.y=y;
    this.shop=shop; this.name=name;
    this.type='vendor';
    this.ch='v';
  }
}
