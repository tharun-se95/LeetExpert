def max_profit(prices):
    min_so_far = prices[0]                    # the low-water mark: the cheapest day to have bought
    best = 0                                  # the best profit found so far
    for price in prices:
        best = max(best, price - min_so_far)  # sell today?
        min_so_far = min(min_so_far, price)   # or is today the new cheapest day to buy?
    return best
