def has_pair(nums: list[int], target: int) -> bool:
    """Finds whether any two distinct elements in nums sum to target using a seen set."""
    seen = set()
    for x in nums:
        if target - x in seen:
            return True
        seen.add(x)
    return False
