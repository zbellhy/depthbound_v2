/* Depthbound — src/core/overlays.js
   Purpose: Dev/Help/Minimap overlays
   Dependencies: none
   Data contracts: none
   Touched systems: UI overlays
*/
export class Overlays{
  constructor(version){
    this.version = version;
    this.devEl = document.getElementById('dev-overlay');
    this.helpEl = document.getElementById('help-overlay');
    this.minimap = document.getElementById('minimap');
    this.helpVisible=false; this.devVisible=false; this.minimapVisible=false;
  }
  updateDev(state){
    if (!this.devVisible) return;
    const s = state;
    this.devEl.innerHTML = `
      <div><b>DEV</b> • FPS ${s.fps||0} • v${this.version.version} • ${this.version.date}</div>
      <div>Pos ${s.player?.x||0},${s.player?.y||0} • Seeded RNG</div>
      <div>Visible tiles: ${s.visible?.size||0}</div>
      <div>Inventory: ${(s.run?.inventory?.length)||0} items • Gold: ${(s.profile?.gold)||0}</div>
    `;
  }
  toggleDev(state){ this.devVisible=!this.devVisible; this.devEl.classList.toggle('hidden', !this.devVisible); this.updateDev(state); }
  toggleHelp(){
    this.helpVisible=!this.helpVisible;
    this.helpEl.classList.toggle('hidden', !this.helpVisible);
    if (this.helpVisible){
      this.helpEl.innerHTML = `
        <b>Depthbound — Help</b><br/>
        Move: WASD / Arrows · Interact: E · Menu: Esc<br/>
        Minimap: M · Help: H/F1 · Dev: F9<br/>
        Inventory: I · Character: C<br/>
        Doors: open/close with E<br/>
        Loot: stand next to a ring, press E<br/>
        Vendor: stand next to a vendor, press E<br/>
        Gate: E to enter/exit<br/>
        Sprint-01: Loot, Inventory/Equip, Vendors in Town
      `;
    }
  }
  toggleMinimap(){ this.minimapVisible=!this.minimapVisible; this.minimap.classList.toggle('hidden', !this.minimapVisible); }
  renderMinimap(state){
    if (!this.minimapVisible) return;
    const c = this.minimap;
    const ctx = c.getContext('2d');
    const m = state.map; if (!m) return;
    const W = c.width, H = c.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,W,H);
    const sx = W / m.width, sy = H / m.height;
    for (let y=0;y<m.height;y++){
      for (let x=0;x<m.width;x++){
        const idx = y*m.width+x;
        if (!state.discovered.has(idx)) continue;
        ctx.fillStyle = '#1f2a44';
        if (state.visible.has(idx)) ctx.fillStyle = '#3a517a';
        ctx.fillRect(Math.floor(x*sx), Math.floor(y*sy), Math.ceil(sx), Math.ceil(sy));
      }
    }
    if (state.player){
      ctx.fillStyle = '#34d399';
      ctx.fillRect(Math.floor(state.player.x*sx), Math.floor(state.player.y*sy), Math.ceil(sx), Math.ceil(sy));
    }
  }
}
