def max_subarray(nums):
    best_ending_here = nums[0]
    best = nums[0]
    for x in nums[1:]:
        best_ending_here = max(x, best_ending_here + x)
        best = max(best, best_ending_here)
    return best
