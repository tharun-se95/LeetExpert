// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { topoSortKahn } = createRequire(import.meta.url)("./code/topo.js");

const NAMES = ["utils", "lexer", "parser", "app"];
const ADJ = [[1, 2], [3], [3], []];
const order = topoSortKahn(4, ADJ);
const pos = new Map(order.map((v, i) => [v, i]));
ADJ.forEach((vs, u) => vs.forEach((v) => assert.ok(pos.get(u) < pos.get(v))));

const cyclic = [[1, 2], [3], [3], [0]];
assert.equal(topoSortKahn(4, cyclic), null);
const indegree = [0, 1, 2, 3].map((u) => cyclic.filter((adj) => adj.includes(u)).length);

console.log(JSON.stringify({ n: 4, edges: ADJ.reduce((a, v) => a + v.length, 0),
  imports: ADJ.flatMap((vs, u) => vs.map((v) => `${NAMES[u]} → ${NAMES[v]}`)).join(", "),
  order: order.map((v) => NAMES[v]).join(" → "),
  ready_in_cycle: indegree.filter((d) => d === 0).length }));
