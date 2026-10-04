def max_of(nums: list[int]) -> int:
    best = nums[0]
    for x in nums:
        if x > best:
            best = x
    return best

def sorted_copy(nums: list[int]) -> list[int]:
    return sorted(nums)

def sum_to(n: int) -> int:
    if n == 0:
        return 0
    return n + sum_to(n - 1)

def sum_iter(n: int) -> int:
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
