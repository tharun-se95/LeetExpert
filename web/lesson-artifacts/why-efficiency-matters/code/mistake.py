def has_pair_mistake(nums: list[int], target: int) -> bool:
    """Mistake: adding before checking pairs a single card with itself when 2x == target."""
    seen = set()
    for x in nums:
        # Adding to seen before checking for complement
        seen.add(x)
        if target - x in seen:
            return True
    return False
