def contains_duplicate_neighbours(nums: list[int]) -> bool:
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:   # only the number right before it
            return True
    return False
