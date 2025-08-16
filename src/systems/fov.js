/* Depthbound — src/systems/fov.js
   Purpose: Shadow-casting FOV (8 octants)
   Dependencies: none
   Data contracts: computeFOV(map,x,y,radius,isOpaque)->Set(indexes)
   Touched systems: rendering, exploration
*/
export function computeFOV(map, x, y, radius){
  const visible = new Set();
  const idx = (xx,yy)=> yy*map.width+xx;
  visible.add(idx(x,y));

  function castOctant(row, start, end, xx, xy, yx, yy){
    if (start < end) return;
    let radiusSq = radius*radius;
    for (let i=row; i<=radius; i++){
      let dx = -i-1, dy = -i, blocked = false;
      let newStart = start;
      while (dx <= 0){
        dx += 1;
        const X = x + dx*xx + dy*xy;
        const Y = y + dx*yx + dy*yy;
        const lSlope = (dx-0.5)/(dy+0.5);
        const rSlope = (dx+0.5)/(dy-0.5);
        if (start < rSlope) continue;
        if (end   > lSlope) break;
        if (!map.inBounds(X,Y)) continue;
        const distanceSq = dx*dx + dy*dy;
        if (distanceSq <= radiusSq){
          visible.add(idx(X,Y));
        }
        const blockedHere = map.isOpaque(X,Y);
        if (blocked){
          if (blockedHere){
            newStart = rSlope;
            continue;
          }else{
            blocked = false;
            start = newStart;
          }
        }else{
          if (blockedHere && i < radius){
            blocked = true;
            castOctant(i+1, start, lSlope, xx,xy,yx,yy);
            newStart = rSlope;
          }
        }
      }
      if (blocked) break;
    }
  }

  castOctant(1, 1.0, 0.0,  1, 0, 0, 1); // E-SE
  castOctant(1, 1.0, 0.0,  0, 1, 1, 0); // S-SE
  castOctant(1, 1.0, 0.0,  0, 1, -1,0); // S-SW
  castOctant(1, 1.0, 0.0, -1, 0, 0, 1); // W-SW
  castOctant(1, 1.0, 0.0, -1, 0, 0,-1); // W-NW
  castOctant(1, 1.0, 0.0,  0,-1, -1,0); // N-NW
  castOctant(1, 1.0, 0.0,  0,-1, 1, 0); // N-NE
  castOctant(1, 1.0, 0.0,  1, 0, 0,-1); // E-NE

  return visible;
}
