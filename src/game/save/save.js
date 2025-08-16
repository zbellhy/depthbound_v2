/* Depthbound — src/game/save/save.js
   Purpose: LocalStorage profile save/load
   Dependencies: none
   Data contracts: profile {name,race_id,class_id}
   Touched systems: title, character create, town
*/
const KEY = 'depthbound_profile_v1';

export const Save = {
  saveProfile(p){ localStorage.setItem(KEY, JSON.stringify(p)); },
  loadProfile(){ try{ return JSON.parse(localStorage.getItem(KEY)); } catch{ return null; } },
  clear(){ localStorage.removeItem(KEY); }
};
