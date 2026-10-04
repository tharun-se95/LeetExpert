// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { ChainedTable } = createRequire(import.meta.url)("./code/chained.js");

function fill(m, keys) {
  const t = new ChainedTable(m);
  for (const k of keys) t.put(k, String(k));
  for (const k of keys) assert.equal(t.get(k), String(k));
  assert.equal(t.get(m * 1e6 + m), null);
  return t;
}
const slot = (t, key) => t.buckets.findIndex((chain) => chain.some(([k]) => k === key));
const scanned = (t, key) => t.buckets[slot(t, key)].map(([k]) => k).indexOf(key) + 1;

const [A, B, C, D] = [10, 18, 3, 7];
const [M, M2] = [4, 8];
const small = fill(M, [A, C, B, D]), doubled = fill(M2, [A, C, B, D]);
assert.ok(slot(small, A) === slot(small, B) && slot(small, C) === slot(small, D));
assert.ok(slot(doubled, A) === slot(doubled, B) && slot(doubled, C) !== slot(doubled, D));

const N = 100, PRANK = 4;
const prankKeys = Array.from({ length: N }, (_, i) => PRANK + M2 * i);
const prank = fill(M2, prankKeys);
assert.ok(prankKeys.every((k) => slot(prank, k) === PRANK));
const spread = fill(128, Array.from({ length: N }, (_, i) => i));

console.log(JSON.stringify({ m: M, m2: M2, a: A, b: B, c: C, d: D,
  slot_ab: slot(small, A), slot_ab2: slot(doubled, A), slot_cd: slot(small, C),
  slot_c2: slot(doubled, C), slot_d2: slot(doubled, D),
  prank_n: N, prank_slot: PRANK, prank_scan: scanned(prank, prankKeys[N - 1]),
  spread_scan: Math.max(...Array.from({ length: N }, (_, i) => scanned(spread, i))) }));
