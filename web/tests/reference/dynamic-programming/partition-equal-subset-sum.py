def can_partition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    reachable = [False] * (target + 1)
    reachable[0] = True
    for x in nums:
        for t in range(target, x - 1, -1):
            if reachable[t - x]:
                reachable[t] = True
    return reachable[target]
