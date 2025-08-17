#!/usr/bin/env node
/**
 * Depthbound — migrate_items_v2_to_v3
 * Purpose: Non-destructively migrate data/items.json (sv=2) to items.v3.migrated.json (sv=3).
 * Usage: node scripts/migrate_items_v2_to_v3.js
 */
const fs = require('fs');
const path = require('path');

const IN = path.join(process.cwd(), 'data', 'items.json');
const OUT = path.join(process.cwd(), 'data', 'items.v3.migrated.json');

function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function toV3(item) {
  const v3 = { ...item };
  v3.equip = v3.equip || {};
  v3.mods = v3.mods || [];
  if (item.stats) {
    for (const [k,v] of Object.entries(item.stats)) {
      if (typeof v === 'number') v3.mods.push({ stat:k, op:'add', value:v });
    }
    delete v3.stats;
  }
  return v3;
}

function main(){
  const src = loadJson(IN);
  const items = Array.isArray(src.items) ? src.items : src;
  const migrated = items.map(toV3);
  const payload = { schema_version: 3, items: migrated };
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log('Wrote', OUT);
}

main();
