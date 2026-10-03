def halving_rounds(n: int) -> int:
    count = 0
    i = n
    while i > 1:
        for _ in range(n):
            count += 1
        i //= 2
    return count
