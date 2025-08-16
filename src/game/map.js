/* Depthbound — src/game/map.js (v0.4.7)
   Purpose: Map container & helpers
   Dependencies: tile.js
   Data contracts: {width,height,tiles:Array,entitiesByPos:Map}
   Touched systems: movement, FOV, render, interaction
*/
export class GameMap{
  constructor(w,h, tiles){
    this.width=w; this.height=h;
    this.tiles = tiles; // array of tile-like objects
    // idx -> FULL entity object (player/enemy/vendor/lootpile/etc.)
    this.entitiesByPos = new Map();
  }
  idx(x,y){ return y*this.width+x; }
  inBounds(x,y){ return x>=0 && y>=0 && x<this.width && y<this.height; }
  get(x,y){ return this.tiles[this.idx(x,y)]; }
  set(x,y,t){ this.tiles[this.idx(x,y)] = t; }

  /** Returns true if a tile is blocked by terrain or by a blocking entity. */
  isBlocked(x,y){
    if (!this.inBounds(x,y)) return true;
    const t = this.get(x,y);
    if (t && t.blocked) return true;
    const ent = this.entitiesByPos.get(this.idx(x,y));
    if (!ent) return false;
    // Loot-related entities do not block movement
    if (ent.type === 'lootpile' || ent.type === 'loot') return false;
    // If an entity explicitly sets blocks=false, honor it
    if (ent.blocks === false) return false;
    // Default: entities block
    return true;
  }

  /** For FOV: returns whether vision is blocked. */
  isOpaque(x,y){
    if (!this.inBounds(x,y)) return true;
    const t = this.get(x,y);
    return !!(t && t.opaque);
  }

  /** Places an entity on the map at its (x,y). Stores the **same object** for fidelity. */
  setEntity(ent){
    // Normalize default blocking behavior once here to avoid surprises elsewhere.
    if (ent.blocks === undefined){
      ent.blocks = (ent.type === 'lootpile' || ent.type === 'loot') ? false : true;
    }
    const idx = this.idx(ent.x, ent.y);
    this.entitiesByPos.set(idx, ent);
  }

  /** Removes whatever entity currently occupies ent.(x,y). Identity match is not required. */
  clearEntity(ent){
    const idx = this.idx(ent.x, ent.y);
    this.entitiesByPos.delete(idx);
  }

  // Compatibility aliases
  isPassable(x,y){ return !this.isBlocked(x,y); }
  isWalkable(x,y){ return !this.isBlocked(x,y); }
}
