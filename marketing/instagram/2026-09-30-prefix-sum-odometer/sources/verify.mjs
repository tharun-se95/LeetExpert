// The JavaScript half of verify.py, on the lesson's own array and queries.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const { buildPrefix, rangeSum } = createRequire(import.meta.url)("./code/prefix.js");

const lesson = readFileSync(new URL("../../../../courses/dsa/prefix-sum/prefix-sum-basics.md", import.meta.url), "utf8");
const viz = JSON.parse(lesson.match(/```viz\n(\{ "id": "prefix-sum"[\s\S]*?\})\n```/)[1]);
const P = buildPrefix(viz.data);
assert.deepEqual(P, [0, 2, 6, 7, 12, 15]);
assert.equal(rangeSum(P, 1, 3), 10);
assert.equal(rangeSum(P, 2, 4), 9);
assert.equal(P[3] - P[1], 5);
assert.equal(rangeSum(P, 0, 4), 15);
let s = 10;
const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
for (let k = 0; k < 2000; k++) {
  const xs = Array.from({ length: 1 + Math.floor(r() * 15) }, () => Math.floor(r() * 101) - 50);
  const l = Math.floor(r() * xs.length), rr = l + Math.floor(r() * (xs.length - l));
  assert.equal(rangeSum(buildPrefix(xs), l, rr), xs.slice(l, rr + 1).reduce((a, b) => a + b, 0));
}
console.log("all reel claims verified (javascript)");
