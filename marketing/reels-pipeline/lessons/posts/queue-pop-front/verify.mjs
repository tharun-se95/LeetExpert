// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { dequeueShift, HeadQueue } = createRequire(import.meta.url)("./code/queues.js");

const counted = (values) => {
  const state = { moves: 0 };
  const items = new Proxy([...values], {
    set(t, p, v) { if (/^\d+$/.test(String(p)) && Number(p) < t.length) state.moves++; t[p] = v; return true; },
  });
  return [items, state];
};

const [small, s] = counted(["A", "B", "C"]);
assert.equal(dequeueShift(small), "A");
assert.deepEqual([...small], ["B", "C"]);

const N = 1000;
const range = Array.from({ length: N }, (_, i) => i);
const [shifting, sh] = counted(range);
const plain = [...range];
const out = range.map(() => dequeueShift(shifting));
assert.deepEqual(out, range.map(() => plain.shift()));

const q = new HeadQueue();
const [items, h] = counted([]);
q.items = items;
for (const x of range) q.enqueue(x);
assert.deepEqual(range.map(() => q.dequeue()), range);

console.log(JSON.stringify({ small_moves: s.moves, n: N, shift_moves: sh.moves, head_moves: h.moves }));
