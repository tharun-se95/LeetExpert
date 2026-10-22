def rotate_cyclic(nums: list[int], k: int) -> None:
    n = len(nums)
    if n == 0:
        return
    k %= n
    cur, carry = 0, nums[0]
    while True:                       # follow ONE chain from slot 0...
        nxt = (cur + k) % n
        nums[nxt], carry = carry, nums[nxt]
        cur = nxt
        if cur == 0:                  # ...and stop when it closes
            break
