// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { hasCycle } = createRequire(import.meta.url)("./code/has_cycle.js");

const ref = readFileSync(new URL("../../../../../web/tests/reference/linked-lists/linked-list-cycle.js", import.meta.url), "utf8");
assert.ok(readFileSync(new URL("./code/has_cycle.js", import.meta.url), "utf8").startsWith(ref));

function build(values, pos) {
  const nodes = values.map((val) => ({ val, next: null }));
  nodes.forEach((n, i) => { if (i + 1 < nodes.length) n.next = nodes[i + 1]; });
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos];
  return nodes[0] ?? null;
}
function steps(head) {
  let slow = head, fast = head, count = 0, found = false;
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next; count++;
    if (slow === fast) { found = true; break; }
  }
  assert.equal(found, hasCycle(head));
  return [count, found];
}
function visited(head) {
  const seen = new Set();
  for (let node = head; node !== null && !seen.has(node); node = node.next) seen.add(node);
  return seen.size;
}

const N = 10000;
const values = Array.from({ length: N }, (_, i) => i + 1);
const [ex, exFound] = steps(build([3, 2, 0, -4], 1));
const [loop, loopFound] = steps(build(values, 0));
const [tail, tailFound] = steps(build(values, N - 1));
const [none, noneFound] = steps(build(values, -1));
assert.deepEqual([exFound, loopFound, tailFound, noneFound], [true, true, true, false]);
assert.ok(hasCycle(null) === false && hasCycle(build([1, 2], -1)) === false);

console.log(JSON.stringify({ ex_steps: ex, n: N, loop_steps: loop, tail_steps: tail, none_steps: none,
  set_nodes: visited(build(values, 0)), pointers: 2 }));
