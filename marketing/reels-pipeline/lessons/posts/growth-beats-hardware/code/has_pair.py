def has_pair_a(nums: list[int], target: int) -> bool:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return True
    return False


def has_pair_b(nums: list[int], target: int) -> bool:
    seen = set()
    for x in nums:
        if target - x in seen:
            return True
        seen.add(x)
    return False
