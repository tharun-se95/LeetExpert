def longest_consecutive(nums):
    seen = set(nums)
    best = 0
    for v in seen:
        if v - 1 in seen:
            continue
        length = 1
        while v + length in seen:
            length += 1
        best = max(best, length)
    return best
