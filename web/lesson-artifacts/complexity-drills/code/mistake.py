def drill4_mistake(nums: list[int], target: int) -> bool:
    """Mistake: treating slicing and membership search as O(1) in the loop body."""
    for x in nums:
        # Slicing creates a new list O(n) and membership scans it O(n), hiding O(n²) work
        if x in nums[1:]:
            pass
        if x == target:
            return True
    return False
