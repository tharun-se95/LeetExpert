function maxProfit(prices: number[]): number {
  let minSoFar = 0;                              // "prices are never negative, so 0 is a safe start"
  let best = 0;
  for (const price of prices) {
    best = Math.max(best, price - minSoFar);
    minSoFar = Math.min(minSoFar, price);
  }
  return best;
}
