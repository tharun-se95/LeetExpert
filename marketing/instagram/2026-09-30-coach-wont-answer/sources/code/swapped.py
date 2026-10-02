def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        seen[n] = i
        if target - n in seen:
            return [i, seen[target - n]]
