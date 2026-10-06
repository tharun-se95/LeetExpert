// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { bruteArea, maxArea } = createRequire(import.meta.url)("./code/container.js");

// both functions call Math.max once per container they measure
const realMax = Math.max;
const measured = (fn, height) => {
  let calls = 0;
  Math.max = (...args) => { calls++; return realMax(...args); };
  try { return [fn(height), calls]; } finally { Math.max = realMax; }
};

const example = [1, 8, 6, 2, 5, 4, 8, 3, 7];
const [a, smallPairs] = measured(bruteArea, example);
const [b, smallSteps] = measured(maxArea, example);
assert.equal(a, 49);
assert.equal(b, 49);
const first = (example.length - 1) * Math.min(example[0], example.at(-1));
const line0 = realMax(...example.slice(1).map((h, k) => (k + 1) * Math.min(example[0], h)));
assert.ok(example[0] <= example.at(-1));
assert.equal(first, line0);

const N = 1000;
const heights = Array.from({ length: N }, (_, i) => (i * 37 + 11) % 101);
const [c, pairs] = measured(bruteArea, heights);
const [d, steps] = measured(maxArea, heights);
assert.equal(c, d);

console.log(JSON.stringify({ answer: a, small_pairs: smallPairs, small_steps: smallSteps, first_area: first,
  line0_best: line0, n: N, pairs, steps }));
