def rotate(nums, k):
    nums[:] = nums[-k:] + nums[:-k]
