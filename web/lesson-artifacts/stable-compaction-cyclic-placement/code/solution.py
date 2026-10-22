def keep_if(nums: list[int], keep) -> int:
    write = 0
    for read in range(len(nums)):
        if keep(nums[read]):
            nums[write] = nums[read]
            write += 1
    return write          # keepers occupy nums[0:write]
