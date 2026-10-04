// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { joinBad, joinGood } = createRequire(import.meta.url)("./code/joins.js");

const copiesBad = (words) => {
  let total = 0, result = "";
  for (const w of words) {
    total += result.length + w.length;
    result += w;
  }
  return total;
};
const copiesGood = (words) => words.reduce((a, w) => a + w.length, 0);

const small = ["a", "b", "c", "d"];
const N = 1000;
const big = Array(N).fill("x");
for (const words of [small, big, ["ab", "", "cde"]]) {
  assert.equal(joinBad(words), joinGood(words));
  assert.equal(joinGood(words), words.join(""));
}
assert.equal(copiesBad(big), (N * (N + 1)) / 2);
assert.equal(copiesBad(Array(50).fill("xy")), (2 * 50 * 51) / 2);
console.log(JSON.stringify({ small_bad: copiesBad(small), small_good: copiesGood(small), n: N,
  big_bad: copiesBad(big), big_good: copiesGood(big), ratio: Math.floor(copiesBad(big) / copiesGood(big)) }));
