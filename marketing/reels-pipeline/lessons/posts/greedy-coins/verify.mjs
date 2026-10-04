// The same facts from the JavaScript twins; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { greedyChange } = require("./code/greedy.js");
const { coinChange } = require("./code/coin_change.js");

const ref = readFileSync(new URL("../../../../../web/tests/reference/dynamic-programming/coin-change.js", import.meta.url), "utf8");
assert.ok(readFileSync(new URL("./code/coin_change.js", import.meta.url), "utf8").startsWith(ref));

// every multiset of `size` coins, largest first
function* multisets(coins, size, start = 0) {
  if (size === 0) { yield []; return; }
  for (let i = start; i < coins.length; i++) for (const rest of multisets(coins, size - 1, i)) yield [coins[i], ...rest];
}
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
function best(coins, amount) {
  const n = coinChange(coins, amount);
  const desc = [...coins].sort((a, b) => b - a);
  for (let k = 0; k < n; k++) for (const c of multisets(desc, k)) assert.notEqual(sum(c), amount);
  for (const c of multisets(desc, n)) if (sum(c) === amount) return c;
}

const show = (coins) => coins.join(" + ");
const BAD = [1, 3, 4], TARGET = 6, OK = [1, 2, 5], OK_TARGET = 11, UPTO = 100;
const g = greedyChange(BAD, TARGET), b = best(BAD, TARGET);
let wrong = 0;
for (let a = 1; a <= UPTO; a++) if (greedyChange(BAD, a).length > coinChange(BAD, a)) wrong++;

console.log(JSON.stringify({ greedy_str: show(g), greedy_n: g.length, best_str: show(b), dp_n: coinChange(BAD, TARGET),
  ok_str: show(greedyChange(OK, OK_TARGET)), ok_n: greedyChange(OK, OK_TARGET).length, ok_dp: coinChange(OK, OK_TARGET),
  upto: UPTO, wrong }));
