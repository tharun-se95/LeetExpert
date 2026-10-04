// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

// The twin is run as a plain script so its function names are bindings this file can wrap:
// the recursive call inside sumTo then goes through the counter too.
const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL("./code/space.js", import.meta.url), "utf8"), ctx);

const N = 500;
const nums = Array.from({ length: N }, (_, i) => N - i);
const copy = ctx.sortedCopy(nums);
assert.ok(copy !== nums && copy.every((x, i) => x === i + 1) && ctx.maxOf(nums) === N);

function deepest(name, n) {
  vm.runInContext(`
    var __depth = 0, __peak = 0, __orig = ${name};
    ${name} = function (n) { __depth++; __peak = Math.max(__peak, __depth); try { return __orig(n); } finally { __depth--; } };
  `, ctx);
  const result = ctx[name](n);
  const peak = vm.runInContext(`${name} = __orig; __peak`, ctx);
  assert.equal(result, (n * (n + 1)) / 2);
  return peak;
}
const framesRec = deepest("sumTo", N), framesIter = deepest("sumIter", N);

const BIG = 100000;
assert.throws(() => ctx.sumTo(BIG), (err) => err.name === "RangeError" && /call stack/i.test(err.message));
assert.equal(ctx.sumIter(BIG), (BIG * (BIG + 1)) / 2);

console.log(JSON.stringify({ n: N, copy_cells: copy.length, frames_rec: framesRec, frames_iter: framesIter, big: BIG }));
