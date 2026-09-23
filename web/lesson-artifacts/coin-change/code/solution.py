def coin_change(coins, amount):
    INF = amount + 1                       # larger than any real answer
    dp = [0] + [INF] * amount              # dp[a] = fewest coins that make exactly a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:                     # the last coin cannot exceed the amount
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else -1
