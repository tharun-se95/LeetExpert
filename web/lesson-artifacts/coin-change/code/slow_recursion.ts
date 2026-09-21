function coinChange(coins: number[], amount: number): number {
  function fewest(a: number): number {
    if (a === 0) return 0;
    let best = Infinity;
    for (const c of coins) {
      // try every coin as the last one
      if (c <= a) best = Math.min(best, fewest(a - c) + 1);
    }
    return best;
  }

  const result = fewest(amount);
  return result !== Infinity ? result : -1;
}
