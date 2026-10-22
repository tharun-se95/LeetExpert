def move_zeroes(nums: list[int]) -> None:
    # Trap: compacts non-zeroes but omits the fill pass, leaving stale values in the tail
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write] = nums[read]
            write += 1
