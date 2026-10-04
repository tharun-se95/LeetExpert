// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { lowestCommonAncestor } = createRequire(import.meta.url)("./code/lca.js");

const ref = readFileSync(new URL("../../../../../web/tests/reference/binary-trees/lowest-common-ancestor-of-a-binary-tree.js", import.meta.url), "utf8");
assert.ok(readFileSync(new URL("./code/lca.js", import.meta.url), "utf8").startsWith(ref));

function build(level) {
  const nodes = level.map((v) => (v === null ? null : { val: v, left: null, right: null }));
  let k = 1;
  for (const node of nodes) {
    if (node !== null) {
      node.left = nodes[k++] ?? null;
      node.right = nodes[k++] ?? null;
    }
  }
  return [nodes[0], new Map(nodes.filter(Boolean).map((n) => [n.val, n]))];
}

const [root, by] = build([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
const lca = (p, q) => {
  const a = lowestCommonAncestor(root, by.get(p), by.get(q)).val;
  assert.equal(a, lowestCommonAncestor(root, by.get(q), by.get(p)).val);
  return a;
};

console.log(JSON.stringify({ nodes: by.size, lca_5_1: lca(5, 1), lca_5_4: lca(5, 4), lca_7_4: lca(7, 4),
  lca_6_4: lca(6, 4), lca_7_8: lca(7, 8) }));
