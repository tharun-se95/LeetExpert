def max_sum_k(nums, k):
    best = float("-inf")
    for i in range(len(nums) - k):
        best = max(best, sum(nums[i:i + k]))
    return best
