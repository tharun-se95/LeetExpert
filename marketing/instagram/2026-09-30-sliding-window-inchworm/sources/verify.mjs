// The JavaScript half of verify.py, on the lesson's own cases.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const { minSubArrayLen, minSubArrayLenIfBug } = createRequire(import.meta.url)("./code/twins.js");
const lesson = readFileSync(new URL("../../../../courses/dsa/sliding-window/minimum-size-subarray-sum.md", import.meta.url), "utf8");
const cases = JSON.parse(lesson.match(/```sandbox\n([\s\S]*?)\n```/)[1]).cases;
for (const c of cases) assert.equal(minSubArrayLen(...c.args), c.expect);
assert.equal(cases.filter((c) => minSubArrayLenIfBug(...c.args) !== c.expect).length, 4);
assert.equal(minSubArrayLenIfBug(7, [2, 3, 1, 2, 4, 3]), 4);
assert.equal(minSubArrayLen(5, [4, -2, -3, 4, 1]), 0);
console.log("all reel claims verified (javascript)");
