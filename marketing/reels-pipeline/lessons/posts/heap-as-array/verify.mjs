// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { parent, left, right } = createRequire(import.meta.url)("./code/heap_index.js");

const HEAP = [1, 3, 2, 7, 4, 5, 8];
for (let c = 1; c < HEAP.length; c++) assert.ok(HEAP[parent(c)] <= HEAP[c]);
for (let i = 0; i < 1000; i++) assert.ok(parent(left(i)) === i && parent(right(i)) === i);

const I = 1, C = 6, REF_BYTES = 16, N = 1000000;
console.log(JSON.stringify({ i: I, l: left(I), r: right(I), lv: HEAP[left(I)], rv: HEAP[right(I)],
  c: C, pc: parent(C), pv: HEAP[parent(C)], cv: HEAP[C],
  n: N, ref_bytes: REF_BYTES, pointer_bytes: REF_BYTES * N }));
