// The JavaScript half of verify.py: the same search on the JS twin.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { binarySearch } = createRequire(import.meta.url)("./code/binary_search.js");
const arr = [1, 3, 5, 7, 9, 11, 13];
assert.equal(binarySearch(arr, 9), 4);
assert.equal(binarySearch(arr, 13), 6);
assert.equal(binarySearch(arr, 8), -1);
let s = 13;
const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
for (let t = 0; t < 3000; t++) {
  const a = [...new Set(Array.from({ length: Math.floor(r() * 20) }, () => Math.floor(r() * 100) - 50))].sort((x, y) => x - y);
  const target = Math.floor(r() * 110) - 55;
  const got = binarySearch(a, target);
  assert.ok((got === -1 && !a.includes(target)) || a[got] === target);
}
console.log("all reel claims verified (javascript)");
