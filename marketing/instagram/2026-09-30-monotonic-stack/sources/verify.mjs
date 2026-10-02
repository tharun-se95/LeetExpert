// The JavaScript half: the same stack and the same value-stack bug.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { nextGreater, nextGreaterValues } = createRequire(import.meta.url)("./code/twins.js");
assert.deepEqual(nextGreater([2, 1, 5, 3]), [5, 5, -1, -1]);
assert.deepEqual(nextGreater([1, 1, 3]), [3, 3, -1]);
assert.deepEqual(nextGreaterValues([1, 1, 3]), [3, -1, -1]);
assert.deepEqual(nextGreater([4, 3, 2, 5]), [5, 5, 5, -1]);
let s = 16;
const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
for (let t = 0; t < 2000; t++) {
  const xs = Array.from({ length: Math.floor(r() * 15) }, () => Math.floor(r() * 10));
  const want = xs.map((x, i) => xs.slice(i + 1).find((y) => y > x) ?? -1);
  assert.deepEqual(nextGreater(xs), want);
}
console.log("all reel claims verified (javascript)");
