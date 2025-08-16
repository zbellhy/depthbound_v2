/* Depthbound — src/game/worldgen/caves_gen.js
   Purpose: Rooms + corridors with oriented doors (corridor tile) + CHESTS in rooms
   Dependencies: tile.js, map.js
   Data contracts: buildCaves(state, w,h) -> { map, start, rooms }
   Touched systems: caves scene
*/
import { TILE } from '../../game/tile.js';
import { GameMap } from '../../game/map.js';

export function buildCaves(state, w=50, h=30){
  const rnd = state.rng;
  const tiles = new Array(w*h).fill(0).map(()=>TILE.WALL);
  const map = new GameMap(w,h, tiles);

  const rooms = [];
  const numRooms = 12;

  function carveRect(x,y,wid,hei){
    for (let yy=y; yy<y+hei; yy++){
      for (let xx=x; xx<x+wid; xx++){
        if (map.inBounds(xx,yy)){
          map.set(xx,yy, TILE.FLOOR);
        }
      }
    }
  }
  function carveHCorridor(x1,x2,y){
    for (let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++){
      if (map.inBounds(x,y)) map.set(x,y,TILE.FLOOR);
    }
  }
  function carveVCorridor(y1,y2,x){
    for (let y=Math.min(y1,y2); y<=Math.max(y1,y2); y++){
      if (map.inBounds(x,y)) map.set(x,y,TILE.FLOOR);
    }
  }

  for (let i=0;i<numRooms;i++){
    const rw = 4 + Math.floor(rnd()*8);
    const rh = 4 + Math.floor(rnd()*6);
    const rx = 1 + Math.floor(rnd()*(w-rw-2));
    const ry = 1 + Math.floor(rnd()*(h-rh-2));
    carveRect(rx,ry,rw,rh);
    const center = { x: Math.floor(rx+rw/2), y: Math.floor(ry+rh/2) };
    if (rooms.length>0){
      const prev = rooms[rooms.length-1].center;
      if (rnd() < 0.5) { carveHCorridor(prev.x, center.x, prev.y); carveVCorridor(prev.y, center.y, center.x); }
      else { carveVCorridor(prev.y, center.y, prev.x); carveHCorridor(prev.x, center.x, center.y); }
    }
    rooms.push({ rx,ry,rw,rh, center });
  }

  // Door placement on corridor/outside tile (kept)
  const doorPlaced = new Set();
  const key = (x,y)=> y*w+x;
  const isFloor = (x,y)=> map.inBounds(x,y) && map.get(x,y)===TILE.FLOOR;
  function hasAdjacentDoor(x,y){
    const nb = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx,dy] of nb){ if (doorPlaced.has(key(x+dx,y+dy))) return true; }
    return false;
  }
  function junctionOrientation(ox,oy, rx,ry, awayDx, awayDy){
    if (!isFloor(ox,oy)) return null;
    const nb = [[1,0],[-1,0],[0,1],[0,-1]];
    let forwardFloor=false, lateralFloors=0;
    for (const [dx,dy] of nb){
      const nx=ox+dx, ny=oy+dy;
      if (nx===rx && ny===ry) continue;
      if (isFloor(nx,ny)){
        if (dx===awayDx && dy===awayDy) forwardFloor=true;
        else lateralFloors++;
      }
    }
    if (forwardFloor && lateralFloors===0){
      return (awayDy !== 0) ? 'h' : 'v';
    }
    return null;
  }
  function tryPlaceDoor(outX,outY, orientation){
    if (!orientation) return false;
    if (!map.inBounds(outX,outY) || map.get(outX,outY)!==TILE.FLOOR) return false;
    if (hasAdjacentDoor(outX,outY)) return false;
    map.set(outX,outY, { ...TILE.DOOR_CLOSED, orientation });
    doorPlaced.add(key(outX,outY));
    return true;
  }
  for (const r of rooms){
    const left = r.rx, right = r.rx + r.rw - 1;
    const top = r.ry, bottom = r.ry + r.rh - 1;
    for (let x=left+1; x<right; x++){
      const yTop = top, oxT = x, oyT = yTop-1;
      const oriT = junctionOrientation(oxT,oyT, x,yTop, 0,-1);
      if (oriT) tryPlaceDoor(oxT,oyT, oriT);
      const yBot = bottom, oxB = x, oyB = yBot+1;
      const oriB = junctionOrientation(oxB,oyB, x,yBot, 0, 1);
      if (oriB) tryPlaceDoor(oxB,oyB, oriB);
    }
    for (let y=top+1; y<bottom; y++){
      const xL = left, oxL = xL-1, oyL = y;
      const oriL = junctionOrientation(oxL,oyL, xL,y, -1,0);
      if (oriL) tryPlaceDoor(oxL,oyL, oriL);
      const xR = right, oxR = xR+1, oyR = y;
      const oriR = junctionOrientation(oxR,oyR, xR,y, 1,0);
      if (oriR) tryPlaceDoor(oxR,oyR, oriR);
    }
  }

  // Place 2–4 chests inside rooms (exclude first & last room)
  const chestCount = 2 + Math.floor(rnd()*3);
  let placed = 0, safety=200;
  while (placed < chestCount && safety-- > 0){
    const r = rooms[1 + Math.floor(rnd()*(rooms.length-2))];
    const x = r.rx + 1 + Math.floor(rnd()*Math.max(1, r.rw-2));
    const y = r.ry + 1 + Math.floor(rnd()*Math.max(1, r.rh-2));
    if (map.get(x,y) === TILE.FLOOR){
      map.set(x,y, TILE.CHEST);
      placed++;
    }
  }

  // Exit at last room center
  const last = rooms[rooms.length-1].center;
  map.set(last.x, last.y, TILE.EXIT);

  return { map, start: rooms[0].center, rooms };
}
