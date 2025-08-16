/* Depthbound — src/main.js
   Purpose: Bootstrap app, load version/data, mount first scene. Binds overlays + inventory.
   Dependencies: version.js, input.js, overlays.js, state.js, scenes/*
   Data contracts: VERSION.json, data/*.json
   Touched systems: Scene stack, overlays, HUD, input
*/
import { loadVersion, VersionHUD } from './core/version.js';
import { Input } from './core/input.js';
import { Overlays } from './core/overlays.js';
import { handleGlobalEscape } from './core/pause.js';
import { GameState } from './core/state.js';
import { SceneManager } from './core/scene_manager.js';
import { TitleScene } from './game/scenes/title.js';
import { openInventory } from './ui/inventory.js';

const screen = document.getElementById('screen-canvas') || document.getElementById('screen');

async function boot(){
  const version = await loadVersion();
  VersionHUD.mount(version);

  const input = new Input(document);
  const overlays = new Overlays(version);
  const state = new GameState({ version, input, overlays });

  const sceneManager = new SceneManager({ screen, state });
  state.sceneManager = sceneManager;
  sceneManager.push(new TitleScene(sceneManager));

  input.bind('F9', () => overlays.toggleDev(state));
  input.bind('F1', () => overlays.toggleHelp());
  input.bind('KeyH', () => overlays.toggleHelp());
  input.bind('KeyM', () => overlays.toggleMinimap());
  input.bind('KeyI', () => openInventory(state));
  input.bind('KeyC', () => openInventory(state, 'equip'));
  input.bind('Escape', () => handleGlobalEscape(state));

  let last = performance.now();
  function frame(now){
    const dt = (now - last)/1000;
    last = now;
    state.fps = Math.round(1/Math.max(dt, 1e-6));
    sceneManager.update(dt);
    sceneManager.render();
    overlays.renderMinimap(state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

boot();
