/* Depthbound — src/systems/vendor_stock.js
   Purpose: Fixed vendor stock per shop type for MVP buy/sell
   Note: IDs must exist in data/items.json
*/
export function getVendorStock(shop='general'){
  const base = {
    general: [
      { id:'health_potion_small', qty: 5 },
      { id:'health_potion_medium', qty: 2 },
      { id:'throwing_knife', qty: 6 },
      { id:'elixir_of_grit', qty: 2 },
    ],
    arms: [
      { id:'rusted_dagger', qty: 2 },
      { id:'short_sword', qty: 2 },
      { id:'club', qty: 2 },
      { id:'spiked_mace', qty: 1 },
      { id:'hunter_bow', qty: 1 },
    ],
    armor: [
      { id:'leather_cap', qty: 2 },
      { id:'iron_helm', qty: 1 },
      { id:'leather_vest', qty: 2 },
      { id:'iron_cuirass', qty: 1 },
    ]
  };
  return (base[shop] || base.general).map(x=>({ ...x }));
}
