// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { createRequire } from "node:module";
const { collisionChance } = createRequire(import.meta.url)("./code/chance.js");

const firstOverHalf = (slots) => {
  for (let k = 1; k <= slots + 1; k++) if (collisionChance(slots, k) > 0.5) return k;
};

const DAYS = 365, SLOTS = 1000000, THOUSAND = 1000;
const people = firstOverHalf(DAYS);
console.log(JSON.stringify({ days: DAYS, people, p_days: (100 * collisionChance(DAYS, people)).toFixed(1),
  slots: SLOTS, thousand: THOUSAND, p_thousand: (100 * collisionChance(SLOTS, THOUSAND)).toFixed(1),
  k_half: firstOverHalf(SLOTS), half_full: SLOTS / 2 }));
