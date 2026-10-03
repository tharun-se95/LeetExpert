// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { Trie } = createRequire(import.meta.url)("./code/trie.js");

const ref = readFileSync(new URL("../../../../../web/tests/reference/tries/implement-trie.js", import.meta.url), "utf8");
assert.ok(readFileSync(new URL("./code/trie.js", import.meta.url), "utf8").startsWith(ref));

const build = (words) => { const t = new Trie(); for (const w of words) t.insert(w); return t; };
const nodes = (node) => [...node].reduce((a, [ch, child]) => a + (ch === "$" ? 0 : 1 + nodes(child)), 0);
const matched = (t, s) => {
  let node = t.root, n = 0;
  for (const ch of s) {
    if (!node.has(ch)) break;
    node = node.get(ch);
    n++;
  }
  return n;
};

const WORDS = ["car", "card", "cat", "cats"];
const shared = build(WORDS);
const two = build(["card", "cat"]);
assert.ok(two.search("car") === false && two.startsWith("car") === true && two.search("card") === true);

const N = 10000, PREFIX = "pre";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const many = Array.from({ length: N - 3 }, (_, i) =>
  [0, 1, 2, 3].map((k) => alphabet[Math.floor(i / 26 ** k) % 26]).join("") + "x").concat(["prefix", "pretend", "press"]);
const asSet = new Set(many);
assert.equal(asSet.size, N);
const big = build(many);
let scanChecks = 0;
for (const w of asSet) { scanChecks++; w.startsWith(PREFIX); }
assert.ok(big.startsWith(PREFIX) && !big.startsWith("prq"));

console.log(JSON.stringify({ words: WORDS.join(", "), chars: WORDS.reduce((a, w) => a + w.length, 0), nodes: nodes(shared.root),
  cable_matched: matched(two, "cable"), cable_len: "cable".length,
  n: N, scan_checks: scanChecks, prefix_steps: matched(big, PREFIX) }));
