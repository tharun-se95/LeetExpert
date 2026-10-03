def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [True] + [False] * target
    for num in nums:
        for cap in range(num, target + 1):
            if dp[cap - num]:
                dp[cap] = True
    return dp[target]
