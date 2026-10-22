def swap(nums: list[int], i: int, j: int) -> None:
    nums[i], nums[j] = nums[j], nums[i]   # tuple pack, then unpack
