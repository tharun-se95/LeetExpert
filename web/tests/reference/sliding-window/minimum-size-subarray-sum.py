def min_subarray_len(target, nums):
    left = 0
    window_sum = 0
    best = float("inf")
    for right in range(len(nums)):
        window_sum += nums[right]
        while window_sum >= target:
            best = min(best, right - left + 1)
            window_sum -= nums[left]
            left += 1
    return 0 if best == float("inf") else best
