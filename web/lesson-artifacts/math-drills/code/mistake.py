import math


def prev_index(i: int, n: int) -> int:
    # BUG: math.fmod truncates toward zero like JavaScript's %, returning -1 for i = 0
    return int(math.fmod(i - 1, n))


def safe_product(nums: list[int], mod: int) -> int:
    # BUG: float products round once they pass 2**53 (reduced factors near 10**9 multiply to ~10**18)
    acc = 1.0
    for x in nums:
        acc = (acc * float(x % mod)) % mod
    return int(acc)
