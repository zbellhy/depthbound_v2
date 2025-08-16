/* Depthbound — src/game/render.js
   Purpose: Game rendering. Canvas renderer with modern shapes + tooltips.
   Change (v0.3.18): Always draw a gold-oval marker for loot/lootpile; also render piles from state.lootpiles fallback.
*/
import { TILE } from './tile.js';
import { CONFIG } from '../core/config.js';

export function renderCanvas(canvas, state){
  const m = state.map;
  if (!m) return;
  const ts = CONFIG.tileSize;
  const dpr = window.devicePixelRatio || 1;
  const W = m.width * ts;
  const H = m.height * ts;
  if (canvas.width !== Math.floor(W*dpr) || canvas.height !== Math.floor(H*dpr)){
    canvas.width = Math.floor(W*dpr);
    canvas.height = Math.floor(H*dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  const P = CONFIG.palette;

  // Background
  ctx.fillStyle = P.bg;
  ctx.fillRect(0,0,W,H);

  // Tiles
  for (let y=0;y<m.height;y++){
    for (let x=0;x<m.width;x++){
      const idx = y*m.width+x;
      const t = m.tiles[idx];
      const vx = x*ts, vy = y*ts;
      const visible = state.visible.has(idx);
      const seen = state.discovered.has(idx);

      let fill = P.floor;
      if (t === TILE.WALL) fill = P.wall;
      else if (t?.door && !t.door.open) fill = P.door_closed;
      else if (t?.door && t.door.open) fill = P.door_open;
      else if (t === TILE.EXIT) fill = P.exit;
      else if (t === TILE.CHEST) fill = P.chest;

      if (t === TILE.WALL){
        roundRect(ctx, vx+1, vy+1, ts-2, ts-2, 5, fill);
      } else {
        roundRect(ctx, vx+2, vy+2, ts-4, ts-4, 6, P.floor);

        if (t?.door){
          if (t.door.open){
            ctx.strokeStyle = fill; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(vx+4, vy+4); ctx.lineTo(vx+ts-4, vy+ts-4); ctx.stroke();
          } else {
            ctx.fillStyle = P.door_closed;
            if (t.orientation === 'v'){
              ctx.fillRect(vx+ts/2-2, vy+4, 4, ts-8);
            } else {
              ctx.fillRect(vx+4, vy+ts/2-2, ts-8, 4);
            }
          }
        } else if (t === TILE.EXIT){
          ctx.strokeStyle = fill; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(vx+ts/2, vy+ts/2, ts*0.3, 0, Math.PI*2); ctx.stroke();
        } else if (t === TILE.CHEST){
          ctx.fillStyle = fill;
          roundRect(ctx, vx+6, vy+6, ts-12, ts-12, 4, fill);
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(vx+6, vy+ts/2-1, ts-12, 2);
        }
      }

      // Fog
      if (!visible){
        ctx.fillStyle = seen ? P.seenFog : P.fog;
        ctx.fillRect(vx,vy,ts,ts);
      }
    }
  }

  // Entities
  const markers = []; // collect markers for all loot/lootpile (entity map + fallback)
  for (const [idx, ent] of state.map.entitiesByPos.entries()){
    const x = idx % m.width;
    const y = Math.floor(idx / m.width);
    const vx = x*ts, vy = y*ts;
    const inFov = state.visible.has(idx);
    const px = state.player?.x ?? -9999;
    const py = state.player?.y ?? -9999;
    const isAdjacent = (Math.abs(x-px) + Math.abs(y-py)) === 1;
    const isLootLike = (ent?.type === 'loot' || ent?.type === 'lootpile');
    if (!inFov && !(isAdjacent && isLootLike)) {
      // not visible, skip draw (marker may still be drawn later)
    } else {
      if (ent.ch === '@'){
        ctx.fillStyle = P.player;
        ctx.beginPath(); ctx.arc(vx+ts/2, vy+ts/2, ts*0.35, 0, Math.PI*2); ctx.fill();
      } else if (ent.ch === 'g'){
        ctx.fillStyle = P.enemy;
        ctx.beginPath();
        ctx.moveTo(vx+ts/2, vy+4);
        ctx.lineTo(vx+ts-4, vy+ts/2);
        ctx.lineTo(vx+ts/2, vy+ts-4);
        ctx.lineTo(vx+4, vy+ts/2);
        ctx.closePath(); ctx.fill();
      } else if (ent.type === 'loot'){
        ctx.save();
        if (!inFov) ctx.globalAlpha = 0.9;
        ctx.strokeStyle = P.loot; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(vx+ts/2, vy+ts/2, ts*0.28, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(vx+ts/2, vy+ts/2, ts*0.18, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      } else if (ent.type === 'lootpile'){
        ctx.save();
        if (!inFov) ctx.globalAlpha = 0.95;
        ctx.fillStyle = P.loot;
        roundRect(ctx, vx+7, vy+10, ts-14, ts-12, 4, P.loot);
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(vx+ts/2-3, vy+ts/2-5, 6, 3);
        ctx.restore();
      } else if (ent.type === 'vendor'){
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.moveTo(vx+ts/2, vy+4);
        ctx.lineTo(vx+ts-4, vy+ts/2);
        ctx.lineTo(vx+ts/2, vy+ts-4);
        ctx.lineTo(vx+4, vy+ts/2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(vx+ts/2-3, vy+ts/2-3, 6, 6);
      }
    }
    if (isLootLike) markers.push({x, y});
  }

  // Fallback draw for piles tracked outside entity map + add markers
  if (Array.isArray(state.lootpiles)){
    for (const pile of state.lootpiles){
      const idx = state.map.idx(pile.x, pile.y);
      if (!state.map.entitiesByPos.has(idx)){
        const x = pile.x, y = pile.y;
        const vx = x*ts, vy = y*ts;
        // Draw a small sack
        ctx.save();
        ctx.fillStyle = P.loot;
        roundRect(ctx, vx+7, vy+10, ts-14, ts-12, 4, P.loot);
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(vx+ts/2-3, vy+ts/2-5, 6, 3);
        ctx.restore();
      }
      markers.push({x: pile.x, y: pile.y});
    }
  }

  // Marker overlay: always draw a gold oval so loot is clearly visible
  for (const {x,y} of markers){
    const vx = x*ts, vy = y*ts;
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = P.loot;
    ctx.beginPath();
    ctx.arc(vx+ts/2, vy+ts/2, ts*0.40, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  drawInteractionTooltip(ctx, state, ts, P);
}

function roundRect(ctx, x,y,w,h,r,c){
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
  ctx.fill();
}

function drawInteractionTooltip(ctx, state, ts, P){
  const m = state.map;
  const px = state.player?.x, py = state.player?.y;
  if (px==null || py==null) return;
  const tips = [];
  const dirs = [[1,0,'→'],[-1,0,'←'],[0,1,'↓'],[0,-1,'↑']];
  const vendorList = state.vendors || null;
  const pileList = state.lootpiles || [];
  for (const [dx,dy,arrow] of dirs){
    const x = px+dx, y = py+dy;
    if (!m.inBounds(x,y)) continue;
    const t = m.get(x,y);
    const idx = m.idx(x,y);
    const ent = m.entitiesByPos.get(idx);
    if (ent?.type==='vendor' || (vendorList && vendorList.some(v=> v.x===x && v.y===y))){
      tips.push(`${arrow} Vendor — E: trade`); continue;
    }
    if (ent?.type==='loot'){ tips.push(`${arrow} Loot — E: pick up`); continue; }
    if (ent?.type==='lootpile' || pileList.some(p=> p.x===x && p.y===y)){
      tips.push(`${arrow} Loot Pile — E: open`); continue;
    }
    if (t?.door){ tips.push(`${arrow} Door — E: ${t.door.open?'close':'open'}`); }
    else if (t === TILE.CHEST){ tips.push(`${arrow} Chest — E: open`); }
    else if (t === TILE.EXIT){ tips.push(`${arrow} Gate — E: enter`); }
  }
  if (!tips.length) return;
  const text = tips.join('\n');
  ctx.font = '500 12px ui-monospace, Menlo, Consolas, monospace';
  const lines = text.split('\n');
  const lineHe = 14;
  const padX = 8, padY = 6;
  let maxW = 0;
  for (const ln of lines){ const w = ctx.measureText(ln).width; if (w>maxW) maxW = w; }
  let bx = px*ts + ts*0.7;
  let by = py*ts - (lineHe*lines.length + padY*2 + 8);
  const canvasW = ctx.canvas.clientWidth || ctx.canvas.width;
  if (bx + maxW + padX*2 > canvasW) bx = px*ts - (maxW + padX*2 + ts*0.2);
  if (by < 0) by = py*ts + ts*0.8;
  ctx.save();
  ctx.fillStyle = P.tooltipBg;
  ctx.strokeStyle = P.tooltipBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, bx, by, maxW + padX*2, lineHe*lines.length + padY*2, 8, P.tooltipBg);
  ctx.strokeRect(bx+0.5, by+0.5, maxW + padX*2-1, lineHe*lines.length + padY*2-1);
  ctx.fillStyle = P.tooltipText;
  let ty = by + padY + 10;
  for (const ln of lines){ ctx.fillText(ln, bx + padX, ty); ty += lineHe; }
  ctx.restore();
}
