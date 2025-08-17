/* Depthbound — src/ui/index.js
   Purpose: Barrel exports for UI modules (single import path)
*/
export { openInventory, ensureItems } from './inventory.js';
export { openLootWindow } from './loot_window.js';
export { openShop } from './shop.js';
import './char_sheet_bootstrap.js';