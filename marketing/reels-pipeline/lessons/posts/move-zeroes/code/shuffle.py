def move_zeroes_shuffle(nums):
    n = len(nums)
    i, end = 0, n
    while i < end:
        if nums[i] == 0:
            for j in range(i, n - 1):
                nums[j] = nums[j + 1]
            nums[n - 1] = 0
            end -= 1
        else:
            i += 1
