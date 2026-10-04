// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { checkInclusionBrute, checkInclusion } = createRequire(import.meta.url)("./code/window.js");

for (const [s1, s2, want] of [["ab", "eidbaooo", true], ["ab", "eidboaoo", false], ["abc", "ab", false], ["a", "a", true]]) {
  assert.equal(checkInclusion(s1, s2), want);
  if (s1.length <= s2.length) assert.equal(checkInclusionBrute(s1, s2), want);
}

// s2 as an array of characters that counts the characters read from it by index
const counted = (text) => {
  const state = { reads: 0 };
  const items = new Proxy([...text], {
    get(t, p) { if (typeof p === "string" && /^\d+$/.test(p)) state.reads++; return t[p]; },
  });
  return [items, state];
};

const N = 10_000, K = 100;
const s2 = Array.from({ length: N }, (_, i) => String.fromCharCode(97 + ((i * 7 + Math.floor(i / 13)) % 25))).join("");
const s1 = "z" + s2.slice(0, K - 1);
const [a, sa] = counted(s2);
const [b, sb] = counted(s2);
assert.equal(checkInclusionBrute(s1, a), false);
assert.equal(checkInclusion(s1, b), false);
const hit = [...s2.slice(5000, 5000 + K)].reverse().join("");
assert.equal(checkInclusionBrute(hit, s2), true);
assert.equal(checkInclusion(hit, s2), true);

console.log(JSON.stringify({ n: N, k: K, windows: N - K + 1, brute_reads: sa.reads, fast_reads: sb.reads }));
