/* Depthbound — src/core/scene_manager.js
   Purpose: Simple scene stack (update/render/input)
   Dependencies: none
   Data contracts: Scene {update(dt), render()}
   Touched systems: scenes
*/
export class SceneManager{
  constructor({ screen, state }){
    this.screen = screen;
    this.state = state;
    this.stack = [];
  }
  push(scene){ this.stack.push(scene); scene.onEnter?.(); }
  pop(){ const s = this.stack.pop(); s?.onExit?.(); return s; }
  swap(scene){ this.pop(); this.push(scene); }
  top(){ return this.stack[this.stack.length-1]; }
  update(dt){ this.top()?.update(dt); }
  render(){ this.top()?.render(); }
}
