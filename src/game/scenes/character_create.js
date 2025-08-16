/* Depthbound — src/game/scenes/character_create.js
   Purpose: Character creation modal (name, race, class)
   Dependencies: data/*.json, save.js, town.js
   Data contracts: profile {name, race_id, class_id}
   Touched systems: scene flow, save
*/
import { TownScene } from './town.js';
import { Save } from '../save/save.js';

async function loadJSON(p){ return (await fetch(p)).json(); }

export class CharacterCreateScene{
  constructor(sm){
    this.sm = sm;
  }
  async onEnter(){
    const [races, classes] = await Promise.all([
      loadJSON('data/races.json'),
      loadJSON('data/classes.json'),
    ]);
    this.races = races.races;
    this.classes = classes.classes;
    this.openForm();
  }
  openForm(){
    const modal = this.openModal(`
      <h3>Create Character</h3>
      <label>Name</label>
      <input id="cc-name" class="input" placeholder="Name" value="Aria"/>
      <label>Race</label>
      <select id="cc-race" class="select">${this.races.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}</select>
      <label>Class</label>
      <select id="cc-class" class="select">${this.classes.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      <div class="small">Background, Birthsign & Perk selection will arrive in Sprint‑01.</div>
      <div style="margin-top:8px">
        <span id="cc-start" class="button">Start</span>
        <span id="cc-cancel" class="button">Cancel</span>
      </div>
    `);
    modal.querySelector('#cc-start').onclick = ()=>{
      const profile = {
        name: modal.querySelector('#cc-name').value || 'Adventurer',
        race_id: modal.querySelector('#cc-race').value,
        class_id: modal.querySelector('#cc-class').value,
      };
      Save.saveProfile(profile);
      this.closeModal();
      this.sm.swap(new TownScene(this.sm));
    };
    modal.querySelector('#cc-cancel').onclick = ()=>{
      this.closeModal();
      history.back(); // go back to Title
    };
  }
  update(){}
  render(){
    this.sm.screen.textContent = 'Character Creation';
  }
  openModal(html){
    const m = document.getElementById('modal');
    const inner = document.getElementById('modal-inner');
    inner.innerHTML = html;
    m.classList.remove('hidden');
    return inner;
  }
  closeModal(){
    document.getElementById('modal').classList.add('hidden');
  }
}
