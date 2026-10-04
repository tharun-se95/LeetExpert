// The same facts from the JavaScript twins; lessons.py fails unless both print the same JSON.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const ref = (name) => readFileSync(new URL(`../../../../../web/tests/reference/bst/${name}.js`, import.meta.url), "utf8");
const own = (name) => readFileSync(new URL(`./code/${name}.js`, import.meta.url), "utf8");
assert.equal(own("insert"), ref("insert-into-a-binary-search-tree"));
assert.equal(own("middle_first"), ref("convert-sorted-array-to-bst"));

// the sandbox runner supplies TreeNode; so does this
const ctx = vm.createContext({});
vm.runInContext("class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }; globalThis.TreeNode = TreeNode;", ctx);
vm.runInContext(own("insert"), ctx);
vm.runInContext(own("middle_first"), ctx);
const fn = (name) => vm.runInContext(name, ctx);
const insert = fn(/function (\w+)/.exec(own("insert"))[1]);
const middleFirst = fn(/function (\w+)/.exec(own("middle_first"))[1]);

const levels = (root) => {
  let count = 0, row = root ? [root] : [];
  while (row.length) {
    count++;
    row = row.flatMap((n) => [n.left, n.right].filter(Boolean));
  }
  return count;
};
const visits = (root, key) => {
  let seen = 0;
  for (let node = root; node; node = key < node.val ? node.left : node.right) {
    seen++;
    if (key === node.val) return seen;
  }
  throw new Error(`${key} not found`);
};
const inserted = (keys) => keys.reduce((root, k) => insert(root, k), null);

const small = inserted([1, 2, 3, 4, 5]);
const N = 1000;
const keys = Array.from({ length: N }, (_, i) => i + 1);
const chain = inserted(keys), bushy = middleFirst(keys);

console.log(JSON.stringify({ small_levels: levels(small), small_visits: visits(small, 5), n: N,
  chain_levels: levels(chain), chain_visits: visits(chain, N),
  balanced_levels: levels(bushy), balanced_visits: Math.max(...keys.map((k) => visits(bushy, k))) }));
