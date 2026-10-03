// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { address, insertFront } = createRequire(import.meta.url)("./code/memory.js");

const BASE = 4096, SLOT = 8, COUNT = 5, I = 3;
const addresses = Array.from({ length: COUNT }, (_, i) => address(BASE, SLOT, i));
addresses.slice(1).forEach((a, k) => assert.equal(a - addresses[k], SLOT));

const counted = (n) => {
  const state = { writes: 0 };
  const store = new Proxy(new Array(n).fill(null), {
    set(t, p, v) { if (/^\d+$/.test(String(p))) state.writes++; t[p] = v; return true; },
  });
  return [store, state];
};

const N = 1000;
const [front, f] = counted(N);
for (let k = 0; k < N; k++) insertFront(front, k, k);
assert.deepEqual([...front], Array.from({ length: N }, (_, k) => N - 1 - k));
assert.equal(f.writes, (N * (N + 1)) / 2);
const [end, e] = counted(N);
for (let k = 0; k < N; k++) end[k] = k;

const LINE = 64, INT = 4;
const perLine = LINE / INT;

console.log(JSON.stringify({ base: BASE, slot: SLOT, i: I, addr: addresses[I], n: N,
  front_writes: f.writes, end_writes: e.writes, line: LINE,
  per_line: perLine, free_reads: perLine - 1, hit_pct: Math.round((100 * (perLine - 1)) / perLine) }));
