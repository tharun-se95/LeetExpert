def max_subarray(nums):
    best = cur = 0
    for x in nums:
        cur = max(x, cur + x)
        best = max(best, cur)
    print("best", best)           # lands in the Console tab, under the case that printed it
    return best
