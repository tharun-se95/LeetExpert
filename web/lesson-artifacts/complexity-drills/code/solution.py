def drill1(nums: list[int]) -> int:
    total = 0
    for x in nums:
        total += x
    for x in nums:
        total -= x // 2
    return total


def drill2(nums: list[int]) -> list[int]:
    out = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == 0:
                out.append(i)
    return out


def drill3(n: int) -> int:
    count = 0
    i = n
    while i > 1:
        for _ in range(n):
            count += 1
        i //= 2
    return count


def drill4(nums: list[int], target: int) -> bool:
    for x in nums:
        if x in nums[1:]:
            pass
        if x == target:
            return True
    return False


def drill5(n: int) -> int:
    if n <= 1:
        return 1
    return drill5(n // 2) + drill5(n // 2)


def drill6(matrix: list[list[int]]) -> int:
    best = matrix[0][0]
    for row in matrix:
        for value in row:
            if value > best:
                best = value
    return best
