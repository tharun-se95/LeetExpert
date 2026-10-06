// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { canJumpBrute, canJump } = createRequire(import.meta.url)("./code/jump.js");

for (const [nums, want] of [[[2, 3, 1, 1, 4], true], [[3, 2, 1, 0, 4], false], [[0], true]]) {
  assert.equal(canJumpBrute(nums), want);
  assert.equal(canJump(nums), want);
}

// an array that counts the elements read from it by index
const counted = (values) => {
  const state = { reads: 0 };
  const items = new Proxy([...values], {
    get(t, p) { if (typeof p === "string" && /^\d+$/.test(p)) state.reads++; return t[p]; },
  });
  return [items, state];
};

const K = 20;
const trap = [...Array.from({ length: K }, (_, i) => K - i), 0, 0];
const [a, sa] = counted(trap);
const [b, sb] = counted(trap);
assert.equal(canJumpBrute(a), false);
assert.equal(canJump(b), false);

console.log(JSON.stringify({ n: trap.length, trap: `[${K}, ${K - 1}, ..., 1, 0, 0]`, brute_reads: sa.reads, sweep_reads: sb.reads }));
