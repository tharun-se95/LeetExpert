function collisionChance(slots, inserts) {
  let clear = 1.0;
  for (let i = 0; i < inserts; i++) clear *= (slots - i) / slots;
  return 1 - clear;
}

module.exports = { collisionChance };
