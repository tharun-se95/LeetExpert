def max_subarray(nums):
    best = cur = 0                # an empty run scores 0, so 0 can win
    for x in nums:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best
