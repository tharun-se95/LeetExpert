def zero_pairs(nums: list[int]) -> list[int]:
    out = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == 0:
                out.append(i)
    return out
