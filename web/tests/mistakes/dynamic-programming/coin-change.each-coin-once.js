function coinChange(coins, amount) {
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (const c of coins) {
    for (let a = amount; a >= c; a--) {
      if (dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
  }
  return dp[amount] >= INF ? -1 : dp[amount];
}
