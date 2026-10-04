// The same facts from the JavaScript twins; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { moveZeroes } = require("./code/move_zeroes.js");
const { moveZeroesShuffle } = require("./code/shuffle.js");

const ref = readFileSync(new URL("../../../../../web/tests/reference/arrays/move-zeroes.js", import.meta.url), "utf8");
assert.ok(readFileSync(new URL("./code/move_zeroes.js", import.meta.url), "utf8").startsWith(ref));

function run(fn, values) {
  let writes = 0;
  const a = new Proxy([...values], {
    set(t, p, v) {
      if (/^\d+$/.test(String(p))) writes++;
      t[p] = v;
      return true;
    },
  });
  fn(a);
  const out = [...a];
  assert.deepEqual(out, [...values.filter((x) => x !== 0), ...values.filter((x) => x === 0)]);
  return [out, writes];
}

const example = [0, 1, 0, 3, 12];
const [out, exampleWrites] = run(moveZeroes, example);
assert.deepEqual(run(moveZeroesShuffle, example)[0], out);

const N = 1000;
const big = Array.from({ length: N }, (_, i) => i % 2);
const [, refWrites] = run(moveZeroes, big);
const [, shuffleWrites] = run(moveZeroesShuffle, big);

console.log(JSON.stringify({ example_out: "[" + out.join(", ") + "]", example_writes: exampleWrites, n: N,
  ref_writes: refWrites, shuffle_writes: shuffleWrites, ratio: Math.floor(shuffleWrites / refWrites) }));
