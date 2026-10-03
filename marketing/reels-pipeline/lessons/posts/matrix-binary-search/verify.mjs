// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { searchMatrix } = createRequire(import.meta.url)("./code/search_matrix.js");

// the twin is the course's checked-in JavaScript reference, plus its export line
const ref = readFileSync(new URL("../../../../../web/tests/reference/matrix/search-a-2d-matrix.js", import.meta.url), "utf8");
assert.ok(readFileSync(new URL("./code/search_matrix.js", import.meta.url), "utf8").startsWith(ref));

let reads = [];
const row = (r, values) => new Proxy(values, {
  get(t, p) {
    if (typeof p === "string" && /^\d+$/.test(p)) reads.push([r, Number(p), t[p]]);
    return t[p];
  },
});
const counted = (matrix, target) => {
  reads = [];
  const found = searchMatrix(matrix.map((v, r) => row(r, v)), target);
  return [found, reads];
};

const example = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]];
const [found, steps] = counted(example, 3);
assert.equal(found, true);
assert.equal(counted(example, 13)[0], false);
const [row0, col0, val0] = steps[0];

const BIG = 100;
const big = Array.from({ length: BIG }, (_, r) => Array.from({ length: BIG }, (_, c) => 2 * (r * BIG + c)));
let worst = 0;
for (let target = -1; target <= 2 * BIG * BIG; target++) {
  const [f, s] = counted(big, target);
  assert.equal(f, target % 2 === 0 && target >= 0 && target < 2 * BIG * BIG);
  worst = Math.max(worst, s.length);
}

console.log(JSON.stringify({ rows: 3, cols: 4, mid0: row0 * 4 + col0, row0, col0, val0,
  checks_example: steps.length, big: BIG, cells: BIG * BIG, worst }));
