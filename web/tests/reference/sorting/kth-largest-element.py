def find_kth_largest(nums, k):
    target_index = len(nums) - k

    def partition(lo, hi):
        pivot = nums[hi]
        boundary = lo
        for i in range(lo, hi):
            if nums[i] < pivot:
                nums[boundary], nums[i] = nums[i], nums[boundary]
                boundary += 1
        nums[boundary], nums[hi] = nums[hi], nums[boundary]
        return boundary

    lo, hi = 0, len(nums) - 1
    while True:
        p = partition(lo, hi)
        if p == target_index:
            return nums[p]
        if p < target_index:
            lo = p + 1
        else:
            hi = p - 1
