/* Depthbound — src/game/scenes/town.js
   Purpose: Town hub; vendors guaranteed visible + interactable (entity + render fallback) + tooltip support
   Dependencies: render.js, tile.js, map.js, player.js, shop.js, vendor.js, config.js
   Data contracts: state.profile.gold persists
   Touched systems: scene flow, shop, rendering (scene-level)
*/
import { renderCanvas } from '../../game/render.js';
import { TILE } from '../../game/tile.js';
import { GameMap } from '../../game/map.js';
import { Player } from '../../game/entities/player.js';
import { Save } from '../save/save.js';
import { CavesScene } from './caves.js';
import { openShop } from '../../ui/index.js';
import { Vendor } from '../entities/vendor.js';
import { CONFIG } from '../../core/config.js';

import { isModalOpen, isEscapeConsumed, isPauseBlocked } from '../../ui/ui_state.js';

export class TownScene{
  constructor(sm){ this.sm = sm; this.vendors = []; }
  fromContinue(profile){ Save.saveProfile(profile); }

  onEnter(){
    const w=40, h=20;
    const tiles = new Array(w*h).fill(0).map(()=>TILE.FLOOR);
    const map = new GameMap(w,h, tiles);
    // Perimeter walls
    for (let x=0;x<w;x++){ map.set(x,0,TILE.WALL); map.set(x,h-1,TILE.WALL); }
    for (let y=0;y<h;y++){ map.set(0,y,TILE.WALL); map.set(w-1,y,TILE.WALL); }

    // Decorative stalls
    for (let x=6;x<12;x++){ map.set(x,5,TILE.WALL); }
    for (let x=18;x<24;x++){ map.set(x,14,TILE.WALL); }

    // Gate to Caves
    map.set(w-2, Math.floor(h/2), TILE.EXIT);

    const st = this.sm.state;
    st.map = map;
    const py = Math.floor(h/2);
    st.player = new Player({ x:4, y:py });
    map.setEntity(st.player);

    // Helper utilities
    const idx = (x,y)=> y*w+x;
    const isFloor = (x,y)=> map.inBounds(x,y) && map.get(x,y)===TILE.FLOOR;
    const isFree = (x,y)=> isFloor(x,y) && !map.entitiesByPos.has(idx(x,y));

    // Preferred local offsets for three vendors, then fallback ring
    const vendorDefs = [
      { shop:'arms',   name:'Rema the Smith',  offsets:[[2,0],[0,-2],[0,2],[3,0],[-2,0],[0,-3],[0,3]] },
      { shop:'armor',  name:'Kesh the Tanner', offsets:[[-2,0],[0,-2],[0,2],[-3,0],[2,0],[0,-3],[0,3]] },
      { shop:'general',name:'Mora the Trader', offsets:[[0,3],[0,-3],[3,0],[-3,0],[2,0],[-2,0]] },
    ];

    this.vendors = [];
    for (const def of vendorDefs){
      let spot = null;
      for (const [dx,dy] of def.offsets){
        const x = st.player.x + dx, y = st.player.y + dy;
        if (isFree(x,y)){ spot = {x,y}; break; }
      }
      if (!spot){
        for (let r=1;r<=8 && !spot;r++){
          for (let dy=-r; dy<=r && !spot; dy++){
            for (let dx=-r; dx<=r && !spot; dx++){
              const x = st.player.x+dx, y = st.player.y+dy;
              if (isFree(x,y)) spot={x,y};
            }
          }
        }
      }
      if (spot){
        const vend = new Vendor({ x:spot.x, y:spot.y, shop:def.shop, name:def.name });
        // Primary entity registration
        map.setEntity(vend);
        // Keep in local list for render/interaction/tooltip fallback
        this.vendors.push(vend);
      }
    }

    st.profile = st.profile || { gold: 0 };
    st.run = st.run || { inventory:[], equipped:{ head:null, body:null, main_hand:null, off_hand:null, trinket:null } };

    st.visible.clear(); st.discovered.clear();
    this.updateFOV();
  }

  update(dt){
    const __st = this.sm.state;
    if (__st.uiActive || (__st.uiBlockFrames>0)){
      if (__st.uiBlockFrames>0) __st.uiBlockFrames--;
      return;
    }
    const st = this.sm.state;
    const input = st.input;
    let dx=0,dy=0;
    if (input.anyJustPressed(['ArrowUp','KeyW'])) dy=-1;
    else if (input.anyJustPressed(['ArrowDown','KeyS'])) dy=1;
    else if (input.anyJustPressed(['ArrowLeft','KeyA'])) dx=-1;
    else if (input.anyJustPressed(['ArrowRight','KeyD'])) dx=1;
    if (dx||dy){
      const nx = st.player.x+dx, ny=st.player.y+dy;
      if (!st.map.isBlocked(nx,ny)){
        st.map.clearEntity(st.player);
        st.player.x=nx; st.player.y=ny;
        st.map.setEntity(st.player);
        this.updateFOV();
      }
    }
    if (input.anyJustPressed(['KeyE'])){
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [dx,dy] of dirs){
        const x = st.player.x+dx, y=st.player.y+dy;
        if (st.map.get(x,y)===TILE.EXIT){ this.sm.swap(new CavesScene(this.sm)); return; }
        const e = st.map.entitiesByPos.get(st.map.idx(x,y));
        if (e?.type==='vendor'){ this.openVendor(e); return; }
        const v = this.vendors.find(v=> v.x===x && v.y===y); if (v){ this.openVendor(v); return; }
      }
      this.openModal('<b>Town</b><br/>Nothing to interact with.');
    }
  }

  openVendor(ent){ openShop(this.sm.state, ent||null); }

  render(){
    // Expose vendor positions for tooltip fallback
    this.sm.state.vendors = this.vendors;
    // Base world render
    renderCanvas(this.sm.screen, this.sm.state);
    // Scene-level draw of vendors to guarantee visibility
    const st = this.sm.state;
    const ctx = this.sm.screen.getContext('2d');
    const ts = CONFIG.tileSize;
    for (const v of this.vendors){
      const idx = st.map.idx(v.x,v.y);
      if (!st.visible.has(idx)) continue;
      const vx = v.x*ts, vy = v.y*ts;
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
    this.sm.state.overlays.updateDev(this.sm.state);
  }

  updateFOV(){
    const st = this.sm.state, m = st.map, r= st.fovRadius;
    st.visible.clear();
    for (let y=st.player.y-r; y<=st.player.y+r; y++){
      for (let x=st.player.x-r; x<=st.player.x+r; x++){
        if (!m.inBounds(x,y)) continue;
        const idx = m.idx(x,y);
        st.visible.add(idx);
        st.discovered.add(idx);
      }
    }
  }

  openModal(html){
    const m = document.getElementById('modal');
    const inner = document.getElementById('modal-inner');
    inner.innerHTML = html + '<div style="margin-top:8px"><span class="button" id="modal-ok">OK</span></div>';
    m.classList.remove('hidden');
    inner.querySelector('#modal-ok').onclick = ()=>this.closeModal();
    return inner;
  }
  closeModal(){ document.getElementById('modal').classList.add('hidden'); }
  openPause(){
    const inner = this.openModal(`<b>Pause</b><br/><div class="small">Sprint-01</div>
      <div style="margin-top:8px">
        <span class="button" id="btn-return-town">Return</span>
        <span class="button" id="btn-quit-title">Quit to Title</span>
      </div>`);
    inner.querySelector('#btn-return-town').onclick = ()=> this.closeModal();
    inner.querySelector('#btn-quit-title').onclick = ()=>{
      this.closeModal();
      import('./title.js').then(({TitleScene})=> this.sm.swap(new TitleScene(this.sm)));
    };
  }
}
