def count_cancelling_pairs(nums: list[int]) -> int:
    """How many packages, taken in pairs, weigh zero together."""
    pairs = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == 0:
                pairs += 1
    return pairs
