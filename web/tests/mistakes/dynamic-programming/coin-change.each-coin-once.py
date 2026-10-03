def coin_change(coins, amount):
    INF = amount + 1
    dp = [0] + [INF] * amount
    for c in coins:
        for a in range(amount, c - 1, -1):
            if dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return -1 if dp[amount] >= INF else dp[amount]
