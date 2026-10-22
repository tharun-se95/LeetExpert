def rotate_cyclic(nums: list[int], k: int) -> None:
    n = len(nums)
    if n == 0:
        return                        # k % 0 would raise
    k %= n                            # k may exceed n
    moved, start = 0, 0
    while moved < n:                  # one pass per cycle
        cur, carry = start, nums[start]
        while True:
            nxt = (cur + k) % n
            nums[nxt], carry = carry, nums[nxt]   # drop the parcel, pick up the one there
            cur = nxt
            moved += 1
            if cur == start:          # the chain has closed
                break
        start += 1                    # the next cycle starts at the next untouched slot
