def can_jump_brute(nums, i=0):
    if i >= len(nums) - 1:
        return True
    for step in range(1, nums[i] + 1):
        if can_jump_brute(nums, i + step):
            return True
    return False

def can_jump(nums: list[int]) -> bool:
    max_reach = 0
    last = len(nums) - 1
    for i in range(len(nums)):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + nums[i])
        if max_reach >= last:
            return True
    return True
