/* Depthbound — src/core/config.js
   Purpose: Central runtime config (renderer, palette, sizes, economy, feature flags)
   Dependencies: none
   Data contracts: read-only CONFIG
   Touched systems: rendering, UI, economy
*/
export const CONFIG = {
  renderer: 'canvas', // 'canvas' | 'ascii' (fallback)
  tileSize: 22,
  features: { resetOnTownExit: true },
  economy: {
    rarityMult: { common:1.0, uncommon:1.4, rare:2.0, epic:3.5, legendary:5.0 },
    buyMult: 1.0,
    sellRate: 0.4
  },
  palette: {
    bg: '#0b1020',
    floor: '#111c31',
    floor_seen: '#0d1527',
    wall: '#2d3958',
    door_closed: '#a78bfa',
    door_open: '#7dd3fc',
    exit: '#22d3ee',
    chest: '#fbbf24',
    player: '#34d399',
    enemy: '#f87171',
    loot: '#eab308',
    fog: 'rgba(7,10,18,0.8)',
    seenFog: 'rgba(7,10,18,0.35)',
    tooltipBg: 'rgba(17,24,39,0.92)',
    tooltipBorder: '#263042',
    tooltipText: '#e6e8eb',
    rarity: {
      common:'#cbd5e1', uncommon:'#7dd3fc', rare:'#7aa2f7', epic:'#c084fc', legendary:'#f59e0b'
    }
  }
};