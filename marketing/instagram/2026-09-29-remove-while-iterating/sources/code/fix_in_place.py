def remove_evens(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] % 2 != 0:
            nums[write] = nums[read]
            write += 1
    del nums[write:]
    return nums
