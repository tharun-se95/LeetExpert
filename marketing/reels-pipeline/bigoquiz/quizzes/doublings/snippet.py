def doublings(n: int) -> int:
    steps = 0
    i = 1
    while i < n:
        steps += 1
        i *= 2
    return steps
