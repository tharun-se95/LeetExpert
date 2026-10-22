function maxProfit(prices: number[]): number {
  const high = prices.reduce((a, b) => Math.max(a, b));
  const low = prices.reduce((a, b) => Math.min(a, b));
  return high - low; // the highest price minus the lowest, in any order
}
