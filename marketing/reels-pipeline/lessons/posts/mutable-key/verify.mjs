// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { slot, demo } = createRequire(import.meta.url)("./code/table.js");

const before = slot([1, 2]);
const [table, key] = demo();
const after = slot(key);
assert.deepEqual(key, [1, 2, 5]);
assert.notEqual(before, after);
assert.equal(table.get(key), null);
assert.deepEqual(table.buckets[before], [[key, "parcel"]]);
const stored = table.buckets.reduce((a, b) => a + b.length, 0);

// what the slides say JavaScript itself does: a Map lets a key be mutated, and never complains
const m = new Map();
const k = { x: 1 };
m.set(k, "parcel");
k.x = 2;
assert.equal(m.get(k), "parcel"); // found only because Map keys on identity, not contents
assert.equal(m.get({ x: 2 }), undefined);

console.log(JSON.stringify({ slot_before: before, slot_after: after, stored }));
