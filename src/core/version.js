/* Depthbound — src/core/version.js
   Purpose: Load version metadata & render HUD
   Dependencies: VERSION.json
   Data contracts: {codename, version, sprint, date}
   Touched systems: HUD
*/
export async function loadVersion(){
  const res = await fetch('./VERSION.json');
  const json = await res.json();
  return json;
}

export const VersionHUD = {
  el: document.getElementById('hud-version'),
  mount(v){
    this.set(v);
  },
  set(v){
    const text = `${v.codename} • v${v.version} • ${v.sprint} • ${v.date}`;
    this.el.textContent = text;
  }
};
