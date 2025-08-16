/* Depthbound — src/game/entities/lootpile.js */
export class LootPile{
  constructor({x,y,items}){
    this.x=x; this.y=y;
    this.type='lootpile';
    this.items = Array.isArray(items) ? items.slice() : [];
    this.ch='*';
  }
}
