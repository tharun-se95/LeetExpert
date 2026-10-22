def remove_duplicates(nums):
    i = 1
    while i < len(nums):
        if nums[i] == nums[i - 1]:
            del nums[i]                # shifts every later element one slot left
        else:
            i += 1
    return len(nums)
