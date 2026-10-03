def two_passes(nums: list[int]) -> int:
    total = 0
    for x in nums:
        total += x
    for x in nums:
        total -= x // 2
    return total
