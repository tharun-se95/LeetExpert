function maxProfit(prices: number[]): number {
  let minSoFar = prices[0];                      // the low-water mark: the cheapest day to have bought
  let best = 0;                                  // the best profit found so far
  for (const price of prices) {
    best = Math.max(best, price - minSoFar);     // sell today?
    minSoFar = Math.min(minSoFar, price);        // or is today the new cheapest day to buy?
  }
  return best;
}
