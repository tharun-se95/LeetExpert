def can_jump(nums):
    max_reach = 0
    last = len(nums) - 1
    for i, n in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + n)
        if max_reach >= last:
            return True
    return True
