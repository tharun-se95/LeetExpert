function maxProfit(prices) {
  let low = Infinity, best = 0;
  for (const p of prices) { low = Math.min(low, p); best = Math.max(best, p - low); }
  return best;
}
