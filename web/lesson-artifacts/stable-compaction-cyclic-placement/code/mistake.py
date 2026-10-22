def keep_if(nums: list[int], keep) -> int:
    for x in nums:                    # the iterator walks by position...
        if not keep(x):
            nums.remove(x)            # ...and remove slides every later car one slot left
    return len(nums)
