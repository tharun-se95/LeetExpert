def has_duplicate(nums: list[int]) -> bool:
    """True when some value appears twice: look for each one among the items after it."""
    for i, x in enumerate(nums):
        if x in nums[i + 1:]:
            return True
    return False
