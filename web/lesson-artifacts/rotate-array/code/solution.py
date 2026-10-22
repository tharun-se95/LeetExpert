def reverse_range(nums, left, right):
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left, right = left + 1, right - 1

def rotate(nums, k):
    n = len(nums)
    k %= n                              # rotating by n puts everything back
    if k == 0:
        return
    reverse_range(nums, 0, n - 1)       # whole row: the last k come first, backwards
    reverse_range(nums, 0, k - 1)       # turn the first block the right way round
    reverse_range(nums, k, n - 1)       # and the second
