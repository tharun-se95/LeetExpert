// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { insertionSort } = createRequire(import.meta.url)("./code/insertion_sort.js");

function run(values) {
  let reads = 0, writes = 0;
  const a = new Proxy([...values], {
    get(t, p) { if (typeof p === "string" && /^\d+$/.test(p)) reads++; return t[p]; },
    set(t, p, v) { if (/^\d+$/.test(String(p))) writes++; t[p] = v; return true; },
  });
  insertionSort(a);
  const passes = values.length - 1;
  const shifts = writes - passes;
  const counts = [shifts, reads - passes - shifts]; // taken before the check below reads the array
  assert.deepEqual([...a], [...values].sort((x, y) => x - y));
  return counts;
}

const small = [5, 4, 3, 2, 1];
const N = 1000, PAIRS = 10;
const ordered = Array.from({ length: N }, (_, i) => i);
const nearly = [...ordered];
for (let i = 0; i < N; i += N / PAIRS) [nearly[i], nearly[i + 1]] = [nearly[i + 1], nearly[i]];

console.log(JSON.stringify({ small_shifts: run(small)[0], n: N, sorted_shifts: run(ordered)[0], sorted_cmp: run(ordered)[1],
  reversed_shifts: run([...ordered].reverse())[0], pairs: PAIRS, nearly_shifts: run(nearly)[0] }));
