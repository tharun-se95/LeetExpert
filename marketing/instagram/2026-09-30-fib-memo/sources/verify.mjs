// The JavaScript half: the same counts from the lesson's TypeScript fib and its memoized twin.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { fib, fibMemo } = createRequire(import.meta.url)("./code/twins.js");

let a = 0, b = 1;
for (let i = 0; i < 26; i++) { assert.equal(fib(i), a); assert.equal(fibMemo(i), a); [a, b] = [b, a + b]; }

// count calls by wrapping: naive calls(n) = 2 fib(n+1) - 1; memoized 2n - 1
function countNaive(n) { let c = 0; const f = (k) => (c++, k < 2 ? k : f(k - 1) + f(k - 2)); f(n); return c; }
// the twin itself, counted through its memo: each computed value is set once, and every
// call that gets past the base case made two calls, so calls = 2 * sets + 1
class CountingMap extends Map { sets = 0; set(k, v) { this.sets++; return super.set(k, v); } }
function countMemo(n) { const m = new CountingMap(); fibMemo(n, m); return 2 * m.sets + 1; }
assert.equal(countNaive(5), 15);
assert.equal(countNaive(6), 25);
assert.equal(countNaive(30), 2_692_537);
assert.equal(2 * fibMemo(41) - 1, 331_160_281);
assert.equal(countMemo(30), 59);
assert.equal(countMemo(40), 79);
assert.equal(fibMemo(40), 102_334_155);

const t0 = performance.now(); fib(35); const tn = performance.now() - t0;
const t1 = performance.now(); for (let i = 0; i < 1000; i++) fibMemo(35); const tm = (performance.now() - t1) / 1000;
console.log(`this machine: naive fib(35) ${tn.toFixed(0)} ms, memoized ${(tm * 1000).toFixed(2)} µs`);
assert.ok(tn / tm > 1000);
console.log("all reel claims verified (javascript)");
