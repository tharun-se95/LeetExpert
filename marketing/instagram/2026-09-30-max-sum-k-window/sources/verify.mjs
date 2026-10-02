// The JavaScript half of verify.py: the same off-by-one, the same slide.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { maxSumKBug, maxSumKSlide } = createRequire(import.meta.url)("./code/twins.js");
assert.equal(maxSumKBug([2, 1, 5, 1, 3, 2], 3), 9);
assert.equal(maxSumKBug([1, 2, 3, 9], 2), 5);
assert.equal(maxSumKBug([4, 5], 2), -Infinity);
assert.equal(maxSumKSlide([1, 2, 3, 9], 2), 12);
assert.equal(maxSumKSlide([4, 5], 2), 9);
let s = 12;
const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
for (let t = 0; t < 2000; t++) {
  const xs = Array.from({ length: 1 + Math.floor(r() * 12) }, () => Math.floor(r() * 41) - 20);
  const k = 1 + Math.floor(r() * xs.length);
  let want = -Infinity;
  for (let i = 0; i + k <= xs.length; i++) want = Math.max(want, xs.slice(i, i + k).reduce((a, b) => a + b, 0));
  assert.equal(maxSumKSlide(xs, k), want);
}
console.log("all reel claims verified (javascript)");
