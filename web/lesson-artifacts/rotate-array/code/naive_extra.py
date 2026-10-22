def rotate(nums, k):
    n = len(nums)
    out = [0] * n                       # a second row: n extra slots
    for i in range(n):
        out[(i + k) % n] = nums[i]      # where index i lands
    for i in range(n):                  # copy the answer back
        nums[i] = out[i]
