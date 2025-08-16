/* Depthbound — src/game/tile.js
   Purpose: Tile constants + helpers
   Dependencies: none
   Data contracts: Tile = {ch, blocked, opaque, door?:{open:boolean}}
   Touched systems: rendering, FOV, movement, interaction
*/
export const TILE = {
  WALL:   { ch: '#', blocked:true,  opaque:true },
  FLOOR:  { ch: '.', blocked:false, opaque:false },
  PLAYER: { ch: '@', blocked:false, opaque:false },
  ENEMY:  { ch: 'g', blocked:false, opaque:false },
  CHEST:  { ch: 'C', blocked:false, opaque:false },
  EXIT:   { ch: '>', blocked:false, opaque:false },
  DOOR_CLOSED: { ch: '+', blocked:true, opaque:true, door:{open:false} },
  DOOR_OPEN:   { ch: '/', blocked:false, opaque:false, door:{open:true} },
};
