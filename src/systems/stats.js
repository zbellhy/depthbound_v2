/*
 Depthbound — src/systems/stats.js
 Purpose: Deterministic stat pipeline (base → add → add_pct → mult → clamp).
 Dependencies: none (pure module). Consumers provide 'base' object and item/mutation modifiers.
 Data contracts:
  - Mods: { stat, op: 'add'|'add_pct'|'mult', value }
  - Stats config: see data/stats.json (schema_version=1)
 Touched systems: equipment, mutations, combat (future), UI character sheet (future).
*/
export function computeStats(base, mods, config) {
  const out = { ...base };
  const adds = {};
  const add_pct = {};
  const mults = {};

  for (const m of (mods || [])) {
    if (!m || m.value == null) continue;
    const k = m.stat;
    switch (m.op) {
      case 'add': adds[k] = (adds[k] || 0) + m.value; break;
      case 'add_pct': add_pct[k] = (add_pct[k] || 0) + m.value; break;
      case 'mult': mults[k] = (mults[k] || 1) * m.value; break;
    }
  }

  // base + add
  for (const k of Object.keys(adds)) out[k] = (out[k] || 0) + adds[k];
  // add_pct
  for (const k of Object.keys(add_pct)) out[k] = Math.floor((out[k] || 0) * (1 + add_pct[k] / 100));
  // mult
  for (const k of Object.keys(mults)) out[k] = Math.floor((out[k] || 0) * mults[k]);

  // derived (very light evaluator; only +,*, identifiers; keep safe)
  const derived = (config?.derived || []);
  for (const d of derived) {
    try {
      const expr = (d.formula || '').replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (name) => String(out[name] ?? 0));
      // eslint-disable-next-line no-new-func
      const val = Function(`return (${expr})`)();
      out[d.id] = Math.max(d.min ?? -Infinity, Math.min(d.max ?? Infinity, Math.floor(val)));
    } catch {
      // ignore bad formula
    }
  }

  // caps
  for (const c of (config?.caps || [])) {
    if (out[c.id] != null) out[c.id] = Math.min(out[c.id], c.max);
  }

  return out;
}
