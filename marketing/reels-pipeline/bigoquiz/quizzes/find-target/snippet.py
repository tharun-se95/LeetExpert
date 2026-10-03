def find_target(nums: list[int], target: int) -> bool:
    for x in nums:
        if x in nums[1:]:
            pass
        if x == target:
            return True
    return False
