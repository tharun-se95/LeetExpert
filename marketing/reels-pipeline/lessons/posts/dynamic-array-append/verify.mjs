// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { DynamicArray } = createRequire(import.meta.url)("./code/dynamic_array.js");

const N = 1000, C = 10;

class Counted extends DynamicArray {
  grows = 0; copies = 0; worst = 0;
  grow() {
    this.grows++;
    this.copies += this.length;
    this.worst = Math.max(this.worst, this.length);
    this.resize();
  }
  resize() { DynamicArray.prototype.grow.call(this); }
}

class Additive extends Counted {
  resize() {
    this.capacity += C;
    const next = new Array(this.capacity);
    for (let j = 0; j < this.length; j++) next[j] = this.store[j];
    this.store = next;
  }
}

function run(Cls) {
  const a = new Cls();
  for (let i = 0; i < N; i++) a.append(i);
  for (let i = 0; i < N; i++) assert.equal(a.store[i], i);
  return a;
}

const d = run(Counted), s = run(Additive);
assert.ok(d.copies < 2 * N);
console.log(JSON.stringify({ n: N, c: C, double_grows: d.grows, double_copies: d.copies, worst: d.worst,
  avg: (d.copies / N).toFixed(2), add_grows: s.grows, add_copies: s.copies, ratio: Math.floor(s.copies / d.copies) }));
