/*
 Depthbound — src/core/feature_flags.js
 Purpose: Central feature toggles. Defaults are all OFF; wiring patch flips these selectively.
 Dependencies: none. Consumers should import this and branch safely.
*/
export const FLAGS = {
  STATS_V2_ENABLED: false,
  SLOTS_V2_ENABLED: false,
  CHAR_SHEET_ENABLED: false,
  MUTATIONS_V1_ENABLED: false
};
