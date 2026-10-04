// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const source = readFileSync(new URL("./code/subarray.js", import.meta.url), "utf8");
const load = (text) => { const module = { exports: {} }; new Function("module", text)(module); return module.exports; };
const { bruteCount, subarrayCount } = load(source);
// the same function with the seed deleted, and nothing else changed
assert.equal(source.split("[[0, 1]]").length, 2);
const unseeded = load(source.replace("[[0, 1]]", "[]")).subarrayCount;

// an array that counts how many of its elements are read
const counted = (values) => {
  const state = { reads: 0 };
  const items = new Proxy([...values], {
    get(t, p) { if (typeof p === "string" && /^\d+$/.test(p)) state.reads++; return t[p]; },
  });
  return [items, state];
};

const small = [1, 2, 3], smallK = 3;
const withSeed = subarrayCount(small, smallK);
const without = unseeded(small, smallK);
assert.equal(withSeed, bruteCount(small, smallK));
assert.equal(withSeed, 2);
assert.equal(without, 1);

const N = 1000, K = 7;
const values = Array.from({ length: N }, (_, i) => ((i * 37 + 11) % 101) - 50);
const [a, sa] = counted(values);
const [b, sb] = counted(values);
const brute = bruteCount(a, K);
const fast = subarrayCount(b, K);
assert.equal(brute, fast);

console.log(JSON.stringify({ small: `[${small.join(", ")}]`, small_k: smallK, small_with: withSeed, small_without: without,
  n: N, k: K, brute_reads: sa.reads, map_reads: sb.reads, count: fast }));
