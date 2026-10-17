def weigh_in_rounds(nums: list[int]) -> int:
    """Re-weigh the whole shelf once per round while the round size halves."""
    total = 0
    size = len(nums)
    while size > 1:
        for x in nums:
            total += x
        size //= 2
    return total
