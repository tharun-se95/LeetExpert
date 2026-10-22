function maxProfit(prices: number[]): number {
  let minSoFar = prices[0];
  let best = 0;
  for (const price of prices) {
    minSoFar = Math.min(minSoFar, price);        // lower the mark first...
    best = Math.max(best, price - minSoFar);     // ...then sell against it
  }
  return best;
}
