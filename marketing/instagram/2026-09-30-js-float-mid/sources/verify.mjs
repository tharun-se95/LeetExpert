// Recomputes every claim the float-mid reel shows or says, in JavaScript (the language of the bug).
// Run: node verify.mjs && PYTHONDONTWRITEBYTECODE=1 python3 verify.py
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const bug = req("./code/bug.js").binarySearch;
const fixed = req("./code/fixed.js").binarySearch;

// the test list: seven numbers, every target found
const seven = [1, 3, 5, 7, 9, 11, 13];
seven.forEach((v, i) => assert.equal(bug(seven, v), i));
// the failure: [2,4,6,8] for 6 -> -1
assert.equal(bug([2, 4, 6, 8], 6), -1);
assert.equal(fixed([2, 4, 6, 8], 6), 2);
// the walk: lo=0, hi=3, mid=1.5, arr[1.5] undefined, every comparison false, hi -> 0.5
const arr = [2, 4, 6, 8];
assert.equal((0 + 3) / 2, 1.5);
assert.equal(arr[1.5], undefined);
assert.equal(undefined === 6, false);
assert.equal(undefined < 6, false);
assert.equal(1.5 - 1, 0.5);
// which lengths hide it: exactly one less than a power of two, checked for every n up to 1000
const hides = (n) => {
  const a = Array.from({ length: n }, (_, i) => 2 * i + 1);
  return a.every((v, i) => bug(a, v) === i);
};
for (let n = 1; n <= 1000; n++) assert.equal(hides(n), ((n + 1) & n) === 0, `n=${n}`);
assert.deepEqual([...Array(16).keys()].map((i) => i + 1).filter(hides), [1, 3, 7, 15]);
// challenge: the next length after 7 that hides it
assert.equal([...Array(100).keys()].map((i) => i + 8).find(hides), 15);
// the fix finds every target at every length, and misses absent ones
for (let n = 0; n <= 200; n++) {
  const a = Array.from({ length: n }, (_, i) => 2 * i + 1);
  a.forEach((v, i) => assert.equal(fixed(a, v), i));
  assert.equal(fixed(a, 0), -1);
  assert.equal(fixed(a, 2 * n + 2), -1);
}
console.log("all reel claims verified (javascript)");
