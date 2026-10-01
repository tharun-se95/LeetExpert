// Recomputes facts.json in JavaScript and fails on any difference (CLAUDE.md §2: both runtimes).
// The random targets differ from Python's, so the binary-search bound is checked on its own
// sample rather than compared field by field.
//   node facts.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const want = JSON.parse(readFileSync(join(here, "facts.json"), "utf8"));
const fail = [];
const same = (name, got, exp) => { if (!isDeepStrictEqual(got, exp)) fail.push(`${name}: js ${JSON.stringify(got)} ≠ py ${JSON.stringify(exp)}`); };

// --- valid parentheses -----------------------------------------------------------
const isValid = new Function(`${readFileSync(join(root, "web/tests/reference/stacks/valid-parentheses.js"), "utf8")}; return isValid;`)();
const PAIRS = { ")": "(", "]": "[", "}": "{" };
function trace(s) {
  const stack = [], steps = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch in PAIRS) {
      if (!stack.length || stack[stack.length - 1] !== PAIRS[ch])
        return { s, steps, fail: { at: i, ch, top: stack.length ? stack[stack.length - 1] : null }, valid: false };
      stack.pop();
    } else stack.push(ch);
    steps.push({ ch, stack: stack.join("") });
  }
  return { s, steps, fail: stack.length ? { at: s.length, ch: null, top: stack[stack.length - 1] } : null, valid: !stack.length };
}
const lesson = readFileSync(join(root, "courses/dsa/stacks/valid-parentheses.md"), "utf8");
const cases = JSON.parse(lesson.split("```sandbox\n")[1].split("\n```")[0]).cases;
for (const c of cases) {
  if (isValid(c.args[0]) !== c.expect) fail.push(`reference disagrees with the lesson on ${c.args[0]}`);
  if (trace(c.args[0]).valid !== c.expect) fail.push(`trace disagrees with the lesson on ${c.args[0]}`);
}
same("parens", { cases: cases.length, valid: trace("([{}])"), invalid: trace("([)]"), challenge: { s: "{[]}", valid: isValid("{[]}") } }, want.parens);

// --- linked list as a train --------------------------------------------------------
const car = (name, next = null) => ({ name, next });
const reachable = (h) => { let n = 0; for (; h; h = h.next) n++; return n; };
const hopsTo = (h, k) => { let hops = 0; while (h && h.name !== k) { h = h.next; hops++; } if (!h) throw new Error(`car ${k} missing`); return hops; };
let head = null;
for (let k = 5; k >= 1; k--) head = car(k, head);
const front = [5, 1000, 100000].map((size) => {
  let h = null;
  for (let k = size; k >= 1; k--) h = car(k, h);
  const before = h;
  h = car(0, h);
  return { size, links_written: 1, old_engine_second: h.next === before };
});
let big = null;
for (let k = 1000; k >= 1; k--) big = car(k, big);
const lost = head;
const cars = reachable(head), to5 = hopsTo(head, 5);
head = null;
same("train", { cars, hops_to_5: to5, hops_to_1000: hopsTo(big, 1000), front, reachable_after_losing_head: reachable(head), cars_still_linked_behind: reachable(lost) }, want.train);

// --- binary search ----------------------------------------------------------------
const N = 1_000_000_000;
function worstGuesses(n) { let g = 0; while (n > 0) { g++; n = Math.floor(n / 2); } return g; }
function search(n, target) {
  let lo = 0, hi = n - 1, guesses = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2); // lo + hi stays under 2^31 · 1 here, well inside a double's exact range
    guesses++;
    const v = 2 * mid;
    if (v === target) return guesses;
    if (v < target) lo = mid + 1; else hi = mid - 1;
  }
  return guesses;
}
const worst = worstGuesses(N);
if (!(2 ** (worst - 1) <= N && N < 2 ** worst)) fail.push("worst case is not the bit length");
if (worst !== Math.ceil(Math.log2(N + 1))) fail.push(`ceil(log2(n + 1)) is ${Math.ceil(Math.log2(N + 1))}, not ${worst}`);
let seen = 0;
for (const t of [0, 2 * (N - 1), -1, 2 * N, 1, 2 * Math.floor(N / 2)]) seen = Math.max(seen, search(N, t));
for (let i = 0; i < 20000; i++) seen = Math.max(seen, search(N, Math.floor(Math.random() * (2 * N + 2)) - 1));
if (seen !== worst) fail.push(`a search took ${seen} guesses, not the bound ${worst}`);
same("bsearch.worst", worst, want.bsearch.worst);
same("bsearch.trillion", worstGuesses(1e12), want.bsearch.trillion);
same("bsearch.max_seen", seen, want.bsearch.max_seen);
same("bsearch.bit_length", N.toString(2).length, want.bsearch.bit_length);

// --- Big-O at n = 1,000 -------------------------------------------------------------
let steps = 0;
for (let i = 0; i < 1000; i++) for (let j = 0; j < 1000; j++) steps++;
same("bigo", { n: 1000, n2: steps, nlogn: Math.round(1000 * Math.log2(1000)), logn: Math.round(Math.log2(1000) * 100) / 100 }, want.bigo);

if (fail.length) { console.error(fail.join("\n")); process.exit(1); }
console.log(`facts.json matches in JavaScript: ${cases.length} lesson cases, ${worst} guesses for a billion, ${steps.toLocaleString("en")} steps at n = 1,000`);
