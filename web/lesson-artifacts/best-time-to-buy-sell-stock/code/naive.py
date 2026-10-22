def max_profit(prices):
    best = 0
    for buy in range(len(prices)):
        for sell in range(buy + 1, len(prices)):   # every later day
            best = max(best, prices[sell] - prices[buy])
    return best
