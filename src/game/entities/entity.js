/* Depthbound — src/game/entities/entity.js
   Purpose: Base entity
   Dependencies: none
   Data contracts: {x,y,ch,name,hp,pow}
   Touched systems: map entities
*/
export class Entity{
  constructor({x=0,y=0,ch='?',name='Entity',hp=1,pow=1}){
    this.x=x; this.y=y; this.ch=ch; this.name=name; this.hp=hp; this.pow=pow;
  }
}
