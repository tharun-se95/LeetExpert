def remove_duplicates(nums):
    write = 1                          # nums[0] is always kept: nothing precedes it
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:   # differs from the last kept value?
            nums[write] = nums[read]        # then it is new: keep it
            write += 1
    return write                       # nums[0..write) holds the distinct values
