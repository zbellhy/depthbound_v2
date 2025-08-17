/*
 Depthbound — src/core/feature_flags.js
 Purpose: Central feature toggles. Defaults were OFF; this wiring patch turns them ON.
 Dependencies: none. Consumers should branch safely.
*/
export const FLAGS = {
  STATS_V2_ENABLED: true,
  SLOTS_V2_ENABLED: true,
  CHAR_SHEET_ENABLED: true,
  MUTATIONS_V1_ENABLED: true
};
