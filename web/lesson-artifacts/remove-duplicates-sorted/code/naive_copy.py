def remove_duplicates(nums):
    uniq = []                          # a second list: up to n extra slots
    for x in nums:
        if not uniq or x != uniq[-1]:
            uniq.append(x)
    for i, x in enumerate(uniq):       # copy the answer back into the prefix
        nums[i] = x
    return len(uniq)
