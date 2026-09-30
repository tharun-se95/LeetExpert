def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        seen[n] = i
        if target - n in seen:
            return [seen[target - n], i]
