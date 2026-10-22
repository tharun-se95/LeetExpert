from math import gcd

def rotate(nums, k):
    n = len(nums)
    k %= n
    if k == 0:
        return
    for start in range(gcd(n, k)):      # one pass per cycle of i -> (i + k) % n
        held = nums[start]
        i = start
        while True:
            j = (i + k) % n
            nums[j], held = held, nums[j]
            i = j
            if i == start:
                break
