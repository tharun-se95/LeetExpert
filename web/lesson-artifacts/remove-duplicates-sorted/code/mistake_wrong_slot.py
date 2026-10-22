def remove_duplicates(nums):
    write = 1                          # the next slot to fill
    for read in range(1, len(nums)):
        if nums[read] != nums[write]:  # the slot to fill, not the last kept value
            nums[write] = nums[read]
            write += 1
    return write
