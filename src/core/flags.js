/* Depthbound — src/core/flags.js (v0.4.12)
   Purpose: Centralized feature flags with safe defaults
*/
import { CONFIG } from './config.js';
export const FLAGS = {
  status_effects: (CONFIG && CONFIG.flags && 'status_effects' in CONFIG.flags) ? !!CONFIG.flags.status_effects : true,
  combat_ui_v1: (CONFIG && CONFIG.flags && 'combat_ui_v1' in CONFIG.flags) ? !!CONFIG.flags.combat_ui_v1 : false,
};
export default FLAGS;
