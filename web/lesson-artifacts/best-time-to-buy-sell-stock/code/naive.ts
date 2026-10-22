function maxProfit(prices: number[]): number {
  let best = 0;
  for (let buy = 0; buy < prices.length; buy++) {
    for (let sell = buy + 1; sell < prices.length; sell++) { // every later day
      best = Math.max(best, prices[sell] - prices[buy]);
    }
  }
  return best;
}
