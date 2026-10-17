def net_weight(nums: list[int]) -> int:
    """Total weight, then half of each package's weight (rounded down) taken back off."""
    total = 0
    for x in nums:
        total += x
    for x in nums:
        total -= x // 2
    return total
