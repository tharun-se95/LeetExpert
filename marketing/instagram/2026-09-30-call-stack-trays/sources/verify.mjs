// The JavaScript half: the same functions, the same crash, and V8's depth on this machine.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { factorial, broken } = createRequire(import.meta.url)("./code/twins.js");
assert.equal(factorial(3), 6);
assert.equal(factorial(0), 1);
assert.equal(factorial(5), 120);
assert.throws(() => broken(3), (e) => e instanceof RangeError && e.message === "Maximum call stack size exceeded");
// "around ten thousand": the deepest factorial this runtime completes
let lo = 1, hi = 1_000_000;
while (lo < hi) { const m = (lo + hi + 1) >> 1; try { factorial(m); lo = m; } catch { hi = m - 1; } }
console.log(`this machine: V8 completes factorial(${lo})`);
assert.ok(lo > 5_000 && lo < 20_000, `depth ${lo} is not around ten thousand`);
console.log("all reel claims verified (javascript)");
