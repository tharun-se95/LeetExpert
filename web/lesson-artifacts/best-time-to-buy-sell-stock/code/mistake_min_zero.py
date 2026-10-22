def max_profit(prices):
    min_so_far = 0                            # "prices are never negative, so 0 is a safe start"
    best = 0
    for price in prices:
        best = max(best, price - min_so_far)
        min_so_far = min(min_so_far, price)
    return best
