def reverse_range(nums: list[int], left: int, right: int) -> None:
    for i in range(right - left + 1):    # every position, not every pair
        nums[left + i], nums[right - i] = nums[right - i], nums[left + i]
