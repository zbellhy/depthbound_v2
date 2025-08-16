/* Depthbound — src/game/scenes/title.js
   Purpose: Canvas-rendered Title screen with menu (New/Continue/Settings/Quit)
   Dependencies: character_create.js, town.js, save.js
   Data contracts: none
   Touched systems: scene flow, input, rendering
*/
import { Save } from '../save/save.js';
import { CharacterCreateScene } from './character_create.js';
import { TownScene } from './town.js';
import { CONFIG } from '../../core/config.js';

export class TitleScene{
  constructor(sm){
    this.sm = sm;
    this.menu = ['New Game', 'Continue', 'Settings', 'Quit'];
    this.idx = 0;
    this._kp = {}; // key pressed tracker for edge detection
  }
  onEnter(){
    this.load = Save.loadProfile();
  }
  _justPressed(code){
    const now = this.sm.state.input.isDown(code);
    const was = !!this._kp[code];
    this._kp[code] = now;
    return now && !was;
  }
  update(dt){
    // Navigation
    if (this._justPressed('ArrowUp') || this._justPressed('KeyW')){
      this.idx = (this.idx + this.menu.length -1)%this.menu.length;
    }
    if (this._justPressed('ArrowDown') || this._justPressed('KeyS')){
      this.idx = (this.idx +1)%this.menu.length;
    }
    if (this._justPressed('Enter')){
      const choice = this.menu[this.idx];
      if (choice==='New Game'){
        this.sm.swap(new CharacterCreateScene(this.sm));
      }else if (choice==='Continue'){
        if (this.load){
          const scene = new TownScene(this.sm);
          scene.fromContinue(this.load);
          this.sm.swap(scene);
        }
      }else if (choice==='Settings'){
        alert('Settings are coming in Sprint-01.');
      }else if (choice==='Quit'){
        window.close();
      }
    }
  }
  render(){
    const canvas = this.sm.screen;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = Math.min(window.innerWidth || 960, 1024);
    const H = Math.min(window.innerHeight || 540, 640);
    if (canvas.width !== Math.floor(W*dpr) || canvas.height !== Math.floor(H*dpr)){
      canvas.width = Math.floor(W*dpr);
      canvas.height = Math.floor(H*dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const P = CONFIG.palette;
    ctx.fillStyle = P.bg;
    ctx.fillRect(0,0,W,H);

    // Title
    const title = 'Depthbound';
    const sub = 'ASCII-out • Canvas-in';
    ctx.font = '700 48px ui-monospace, Menlo, Consolas, monospace';
    const grad = ctx.createLinearGradient(0,0,W,0);
    grad.addColorStop(0, '#7aa2f7');
    grad.addColorStop(1, '#70e1c7');
    ctx.fillStyle = grad;
    const tw = ctx.measureText(title).width;
    ctx.fillText(title, (W - tw)/2, 120);

    ctx.font = '500 14px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillStyle = '#8b93a1';
    const sw = ctx.measureText(sub).width;
    ctx.fillText(sub, (W - sw)/2, 150);

    // Menu
    const y0 = 220;
    for (let i=0;i<this.menu.length;i++){
      const text = this.menu[i] + ((this.menu[i]==='Continue' && !this.load) ? ' (—)' : '');
      const selected = (i===this.idx);
      ctx.font = '600 22px ui-monospace, Menlo, Consolas, monospace';
      ctx.fillStyle = selected ? '#e6e8eb' : '#8b93a1';
      const mw = ctx.measureText(text).width;
      const x = (W - mw)/2;
      const y = y0 + i*34;
      if (selected){
        // highlight pill
        ctx.fillStyle = 'rgba(122,162,247,0.15)';
        const padX = 12, padY = 8;
        roundRect(ctx, x-padX, y-22, mw+padX*2, 28, 8, 'rgba(122,162,247,0.15)');
        ctx.fillStyle = '#e6e8eb';
      }
      ctx.fillText(text, x, y);
    }

    // Footer hint
    ctx.font = '500 12px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillStyle = '#8b93a1';
    const hint = 'Use ↑/↓ and Enter. F1 for help.';
    const hw = ctx.measureText(hint).width;
    ctx.fillText(hint, (W - hw)/2, H - 40);
  }
}

function roundRect(ctx, x,y,w,h,r, color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
  ctx.fill();
}
