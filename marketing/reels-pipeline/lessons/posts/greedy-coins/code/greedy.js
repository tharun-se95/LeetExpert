function greedyChange(coins, amount) {
  const used = [];
  for (const c of [...coins].sort((a, b) => b - a)) {
    while (amount >= c) {
      amount -= c;
      used.push(c);
    }
  }
  return amount === 0 ? used : null;
}

module.exports = { greedyChange };
