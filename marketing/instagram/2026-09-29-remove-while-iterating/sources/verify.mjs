// The JavaScript half of verify.py: the same claims on the JS twins.
// Run: node verify.mjs  (exits non-zero if a claim drifts)
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { removeEvensBug, removeEvensNewList, removeEvensInPlace } = createRequire(import.meta.url)("./code/twins.js");

// Same bug in JavaScript: for...of walks by index, splice shifts the tail
assert.deepEqual(removeEvensBug([1, 2, 3]), [1, 3]);
assert.deepEqual(removeEvensBug([2, 4, 6, 7]), [4, 7]);
assert.deepEqual(removeEvensBug([1, 2, 2, 3]), [1, 2, 3]);

// Fixes on random lists, negatives included: -3 % 2 is -1 in JS (1 in Python), and !== 0 handles both
let seed = 8;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
for (let i = 0; i < 2000; i++) {
  const xs = Array.from({ length: Math.floor(rnd() * 13) }, () => Math.floor(rnd() * 41) - 20);
  const want = xs.filter((x) => x % 2 !== 0);
  assert.deepEqual(removeEvensNewList([...xs]), want);
  assert.deepEqual(removeEvensInPlace([...xs]), want);
}
assert.equal(-3 % 2, -1);
const xs = [2, 4, 6, 7];
assert.equal(removeEvensInPlace(xs), xs);
assert.deepEqual(xs, [7]);

// A Map does not throw: deleting during for...of is allowed and skips nothing already visited
const m = new Map([[1, "a"], [2, "b"]]);
for (const k of m.keys()) m.delete(k);
assert.equal(m.size, 0);

console.log("all reel claims verified (javascript)");
