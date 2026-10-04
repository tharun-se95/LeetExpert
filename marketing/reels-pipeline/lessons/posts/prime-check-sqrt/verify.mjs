// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { isPrimeSlow, isPrime } = createRequire(import.meta.url)("./code/prime.js");

for (let n = 0; n < 2000; n++) assert.equal(isPrimeSlow(n), isPrime(n));

// JavaScript cannot overload %, so n is an object whose valueOf counts every use of it. For a prime, both
// loops use n once for `n < 2`, once per loop test and once per division, and the loop test runs one more
// time than the division: uses = 2 + 2 * divisions.
const tests = (fn, n) => {
  let uses = 0;
  const result = fn({ valueOf() { uses++; return n; } });
  assert.equal(result, true);
  assert.equal(uses % 2, 0);
  return (uses - 2) / 2;
};

const P = 1_000_003;
console.log(JSON.stringify({ p: P, slow_tests: tests(isPrimeSlow, P), fast_tests: tests(isPrime, P) }));
