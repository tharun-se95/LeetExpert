def max_profit(prices):
    min_so_far = prices[0]
    best = 0
    for price in prices:
        min_so_far = min(min_so_far, price)   # lower the mark first...
        best = max(best, price - min_so_far)  # ...then sell against it
    return best
