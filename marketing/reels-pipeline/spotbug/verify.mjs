// Reruns verify.py in JavaScript (CLAUDE.md §2: both runtimes) and fails unless every fact in
// facts.json comes out the same: buggy.js wrong on the same input with the same answer, fixed.js
// passing every lesson case, the reference agreeing with the lesson.
//   node verify.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const want = JSON.parse(readFileSync(join(here, "facts.json"), "utf8"));
const fail = [];

const sandbox = (lesson) => JSON.parse(readFileSync(join(root, lesson), "utf8").split("```sandbox\n")[1].split("\n```")[0]);
const load = (path, name) => new Function(`${readFileSync(path, "utf8")}; return ${name};`)();
const run = (fn, args, box) => {
  const a = structuredClone(args);
  const out = fn(...a);
  return box.check === "mutate" ? a[0] : out;
};
const norm = (xs) => xs.map((x) => [...x].sort((p, q) => p - q)).sort((p, q) => JSON.stringify(p) < JSON.stringify(q) ? -1 : 1);
const same = (a, b, box) => box.compare === "set-of-sets" ? isDeepStrictEqual(norm(a), norm(b)) : isDeepStrictEqual(a, b);

const got = {};
for (const id of readdirSync(join(here, "bugs")).sort()) {
  const d = join(here, "bugs", id);
  if (!statSync(d).isDirectory()) continue;
  const bug = JSON.parse(readFileSync(join(d, "bug.json"), "utf8"));
  const box = sandbox(bug.lesson);
  const name = box.fn.javascript;
  const ref = load(join(root, "web/tests/reference", basename(dirname(bug.lesson)), `${box.id}.js`), name);
  const buggy = load(join(d, "buggy.js"), name), fixed = load(join(d, "fixed.js"), name);
  const passes = [];
  box.cases.forEach((c, i) => {
    if (!same(run(ref, c.args, box), c.expect, box)) fail.push(`${id}: the reference fails lesson case ${i}`);
    if (!same(run(fixed, c.args, box), c.expect, box)) fail.push(`${id}: fixed.js fails lesson case ${i}: ${JSON.stringify(c.args)}`);
    if (same(run(buggy, c.args, box), c.expect, box)) passes.push(i);
  });
  const expect = run(ref, bug.input, box), returns = run(buggy, bug.input, box);
  if (same(returns, expect, box)) fail.push(`${id}: buggy.js is right on ${JSON.stringify(bug.input)}, so it shows no bug`);
  if (!same(run(fixed, bug.input, box), expect, box)) fail.push(`${id}: fixed.js is wrong on ${JSON.stringify(bug.input)}`);
  const first = box.cases[0];
  // the Python fact names the Python function; everything else must match value for value
  got[id] = { lesson: bug.lesson, fn: want[id]?.fn, cases: box.cases.length, buggy_passes: passes,
    sample: { args: first.args, expect: first.expect, buggy: run(buggy, first.args, box) },
    input: bug.input, returns, expect };
}
for (const id of new Set([...Object.keys(want), ...Object.keys(got)]))
  if (!isDeepStrictEqual(got[id], want[id])) fail.push(`${id}: js ${JSON.stringify(got[id])}\n   ≠ py ${JSON.stringify(want[id])}`);
if (fail.length) {
  console.error(fail.join("\n"));
  process.exit(1);
}
console.log(`${Object.keys(got).length} bugs: JavaScript agrees with facts.json`);
