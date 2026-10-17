def halving_sum(nums: list[int]) -> int:
    """Sum the list by handing each half to a helper call."""
    def go(lo: int, hi: int) -> int:
        if hi - lo <= 1:
            return nums[lo] if hi > lo else 0
        mid = (lo + hi) // 2
        return go(lo, mid) + go(mid, hi)

    return go(0, len(nums))
