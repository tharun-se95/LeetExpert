// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { hasPairA, hasPairB } = createRequire(import.meta.url)("./code/has_pair.js");

const N = 1000;
let reads = 0;
const base = Array.from({ length: N }, (_, i) => i);
const nums = new Proxy(base, { get(t, p) { if (typeof p === "string" && /^\d+$/.test(p)) reads++; return t[p]; } });
assert.equal(hasPairA(nums, -1), false);
assert.equal(hasPairB(base, -1), false);
assert.ok(hasPairA([3, 4, 9], 13) && hasPairB([3, 4, 9], 13));
const checksA = reads / 2;
assert.equal(checksA, (N * (N - 1)) / 2);

const RATE = 1e8, BIG = 100000, HUGE = 10000000, SPEEDUP = 100;
let quad = 1; while (quad * quad < SPEEDUP) quad++;
let exp = 1; while (2 ** exp < SPEEDUP) exp++;

console.log(JSON.stringify({ n1: N, checks_a: checksA, checks_b: N, big: BIG, huge: HUGE,
  a_seconds: Math.floor((BIG * BIG) / 2 / RATE), b_ms: Math.floor((BIG * 1000) / RATE),
  a_days: ((HUGE * HUGE) / 2 / RATE / 86400).toFixed(1), b_seconds: (HUGE / RATE).toFixed(1),
  speedup: SPEEDUP, quad_gain: quad, exp_gain: exp }));
