// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { bruteSpeed, minEatingSpeed } = createRequire(import.meta.url)("./code/koko.js");

// both functions call Math.ceil once per pile for each speed they test
const realCeil = Math.ceil;
const counted = (fn, piles, h) => {
  let calls = 0;
  Math.ceil = (x) => { calls++; return realCeil(x); };
  try { return [fn(piles, h), calls / piles.length]; } finally { Math.ceil = realCeil; }
};
const hours = (piles, speed) => piles.reduce((t, p) => t + Math.ceil(p / speed), 0);

const example = [3, 6, 7, 11], H = 8;
assert.equal(minEatingSpeed(example, H), 4);
assert.equal(bruteSpeed(example, H), 4);
assert.equal(hours(example, 3), 10);
assert.equal(hours(example, 4), 8);
for (const [piles, h, want] of [[[30, 11, 23, 4, 20], 5, 30], [[30, 11, 23, 4, 20], 6, 23]]) {
  assert.equal(minEatingSpeed(piles, h), want);
  assert.equal(bruteSpeed(piles, h), want);
}

const big = [1_000_000, 750_000, 999_999, 250_000, 500_000], bigH = 9;
const [a, bruteChecks] = counted(bruteSpeed, big, bigH);
const [b, binaryChecks] = counted(minEatingSpeed, big, bigH);
assert.equal(a, b);
assert.ok(hours(big, a) <= bigH && bigH < hours(big, a - 1));

console.log(JSON.stringify({ hours_slow: hours(example, 3), hours_ok: hours(example, 4), big_max: Math.max(...big), big_h: bigH,
  big_answer: a, brute_checks: bruteChecks, binary_checks: binaryChecks }));
