// The JavaScript half: the four twins on the lessons' own cases.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const { twoSum, removeDuplicates, maxArea, merge } = createRequire(import.meta.url)("./code/twins.js");
const cases = (p) => JSON.parse(readFileSync(new URL(`../../../../courses/dsa/${p}`, import.meta.url), "utf8").match(/```sandbox\n([\s\S]*?)\n```/)[1]).cases;
for (const c of cases("two-pointers/two-sum-ii.md")) assert.deepEqual(twoSum(...c.args), c.expect);
for (const c of cases("arrays/remove-duplicates-sorted.md")) { const n = [...c.args[0]]; const k = removeDuplicates(n); assert.deepEqual(n.slice(0, k), c.expect); }
for (const c of cases("two-pointers/container-with-most-water.md")) assert.equal(maxArea(...c.args), c.expect);
for (const c of cases("linked-lists/merge-two-sorted.md")) assert.deepEqual(merge(...c.args), c.expect);
console.log("all reel claims verified (javascript)");
