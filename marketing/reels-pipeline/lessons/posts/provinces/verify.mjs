// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { findCircleNum } = createRequire(import.meta.url)("./code/provinces.js");

const ref = readFileSync(new URL("../../../../../web/tests/reference/graphs/number-of-provinces.js", import.meta.url), "utf8");
assert.ok(readFileSync(new URL("./code/provinces.js", import.meta.url), "utf8").startsWith(ref));

const ex1 = findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]]);
const ex2 = findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
assert.deepEqual([ex1, ex2], [2, 3]);

const N = 6;
const LINKS = [[0, 1], [1, 2], [3, 4]];
const m = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 1 : 0)));
for (const [a, b] of LINKS) m[a][b] = m[b][a] = 1;
const count = findCircleNum(m);

const group = Array.from({ length: N }, (_, i) => new Set([i]));
let changed = true;
while (changed) {
  changed = false;
  for (const [a, b] of LINKS) {
    const merged = new Set([...group[a], ...group[b]]);
    for (const c of merged) {
      if (group[c].size !== merged.size) { group[c] = merged; changed = true; }
    }
  }
}
const groups = [...new Set(group.map((g) => [...g].sort((x, y) => x - y).join(", ")))].sort();
assert.equal(groups.length, count);
assert.equal(m[0][2], 0);

console.log(JSON.stringify({ ex1, ex2, n: N, links: LINKS.map(([a, b]) => `${a}–${b}`).join(", "),
  groups: groups.map((g) => `{${g}}`).join(" "), count }));
