// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { OneMin, ScanMin, MinStack } = createRequire(import.meta.url)("./code/min_stack.js");

// an array that counts its elements read while `on` (pop() reads through a Proxy too, so only getMin is timed)
const counted = () => {
  const state = { reads: 0, on: false };
  const items = new Proxy([], {
    get(t, p) { if (state.on && typeof p === "string" && /^\d+$/.test(p)) state.reads++; return t[p]; },
  });
  return [items, state];
};
const show = (xs) => `[${xs.join(", ")}]`;

const one = new OneMin(), right = new MinStack();
for (const v of [-2, 0, -3]) { one.push(v); right.push(v); }
assert.equal(one.getMin(), -3);
assert.equal(right.getMin(), -3);
const mins = [...right.mins];
one.pop();
right.pop();
assert.equal(right.top(), 0);
assert.deepEqual(one.stack, [-2, 0]);
assert.ok(!one.stack.includes(one.getMin()));

const N = 1000;
const values = Array.from({ length: N }, (_, i) => ((i * 37 + 11) % 101) - 50);
const scan = new ScanMin(), snap = new MinStack();
const [stack, sc] = counted();
const [snaps, sn] = counted();
scan.stack = stack;
snap.mins = snaps;
for (const v of values) { scan.push(v); snap.push(v); }
for (let depth = N; depth > 0; depth--) {
  sc.on = sn.on = true;
  const a = scan.getMin(), b = snap.getMin();
  sc.on = sn.on = false;
  assert.equal(a, b);
  assert.equal(a, Math.min(...values.slice(0, depth)));
  scan.pop();
  snap.pop();
}

console.log(JSON.stringify({ one_min_says: one.getMin(), right: right.getMin(), left: show(one.stack), mins: show(mins),
  n: N, scan_reads: sc.reads, snap_reads: sn.reads }));
