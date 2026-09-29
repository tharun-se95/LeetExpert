// The JavaScript half of verify.py: the same claims, in the other runtime.
// Run: node verify.mjs  (exits non-zero if a claim drifts)
import assert from "node:assert/strict";

// The lesson's 26-slot solution
function byArray(s, t) {
  if (s.length !== t.length) return false;
  const counts = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    counts[s.charCodeAt(i) - a]++;
    counts[t.charCodeAt(i) - a]--;
  }
  return counts.every((c) => c === 0);
}

function byMap(s, t) {
  if (s.length !== t.length) return false;
  const m = new Map();
  for (const ch of s) m.set(ch, (m.get(ch) ?? 0) + 1);
  for (const ch of t) m.set(ch, (m.get(ch) ?? 0) - 1);
  return [...m.values()].every((c) => c === 0);
}

assert.equal(byArray("listen", "silent"), true);
assert.equal(byArray("listen", "listens"), false);

// The catch: no crash in JavaScript, just a wrong answer. counts[136] was
// undefined, so ++ makes it NaN, and NaN === 0 is false.
assert.equal(byArray("café", "éfac"), false);
assert.equal(byMap("café", "éfac"), true); // the right answer

// The pitfall: sets drop counts
const setEq = (x, y) => { const a = new Set(x), b = new Set(y); return a.size === b.size && [...a].every((c) => b.has(c)); };
assert.equal(setEq("aacc", "ccac"), true);
assert.equal(byArray("aacc", "ccac"), false);

// Challenge
assert.equal(byArray("aab", "abb"), false);

console.log("all reel claims verified (javascript)");
