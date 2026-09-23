def coin_change(coins, amount):
    count = 0
    for c in sorted(coins, reverse=True):  # always take the biggest coin that fits
        count += amount // c
        amount %= c
    return count if amount == 0 else -1
