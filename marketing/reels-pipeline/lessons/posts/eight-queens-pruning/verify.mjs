// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { place } = createRequire(import.meta.url)("./code/queens.js");

// a set that counts its adds: the shown code adds a column once per queen it places
let adds = 0;
class CountingSet extends Set {
  add(x) { adds++; return super.add(x); }
}
const run = (n) => {
  adds = 0;
  return [place(0, n, new CountingSet(), new Set(), new Set()), adds];
};
const choose = (n, k) => {
  let c = 1n;
  for (let i = 1n; i <= BigInt(k); i++) c = (c * (BigInt(n) - BigInt(k) + i)) / i;
  return Number(c);
};

const [four] = run(4);
assert.equal(four, 2);
const N = 8;
const [solutions, placed] = run(N);

console.log(JSON.stringify({ n: N, cells: N * N, choose: choose(N * N, N), per_row: N ** N,
  placed, solutions, small_solutions: four }));
