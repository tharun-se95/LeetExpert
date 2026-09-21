def coin_change(coins, amount):
    def fewest(a):
        if a == 0:
            return 0
        best = float("inf")
        for c in coins:                    # try every coin as the last one
            if c <= a:
                best = min(best, fewest(a - c) + 1)
        return best

    result = fewest(amount)
    return result if result != float("inf") else -1
