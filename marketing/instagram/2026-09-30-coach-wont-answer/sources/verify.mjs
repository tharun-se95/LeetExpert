// The JavaScript half of verify.py: the same claims on the JS twins, on the lesson's own cases.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const { twoSumDraft, twoSumFixed } = createRequire(import.meta.url)("./code/twins.js");

const lesson = readFileSync(new URL("../../../../courses/dsa/hash-tables/two-sum.md", import.meta.url), "utf8");
const spec = JSON.parse(lesson.match(/```sandbox\n([\s\S]*?)\n```/)[1]);
const pass = (fn) => spec.cases.filter((c) => JSON.stringify(fn(...structuredClone(c.args))) === JSON.stringify(c.expect)).length;

assert.equal(pass(twoSumDraft), 2);
assert.deepEqual(twoSumDraft([3, 2, 4], 6), [0, 0]);
assert.equal(pass(twoSumFixed), 4);
assert.deepEqual(twoSumFixed([3, 3], 6), [0, 1]);
console.log("all reel claims verified (javascript)");
