def reverse_range(nums, left, right):
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left, right = left + 1, right - 1

def rotate(nums, k):
    n = len(nums)
    if k == 0:                          # no k %= n: k may be bigger than n
        return
    reverse_range(nums, 0, n - 1)
    reverse_range(nums, 0, k - 1)       # right = k - 1 can be past the last slot
    reverse_range(nums, k, n - 1)
