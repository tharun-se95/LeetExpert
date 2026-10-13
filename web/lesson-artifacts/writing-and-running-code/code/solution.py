def max_subarray(nums):
    best = cur = nums[0]          # start from a real element, never from 0
    for x in nums[1:]:
        cur = max(x, cur + x)     # extend the run, or start a new one at x
        best = max(best, cur)
    return best
