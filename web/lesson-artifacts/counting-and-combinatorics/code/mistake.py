import math


def n_choose_k(n: int, k: int) -> int:
    if k < 0 or k > n:
        return 0
    # BUG: the three factorials are exact ints, but "/" turns their quotient into a float,
    # which rounds as soon as C(n, k) is past 2**53
    return int(math.factorial(n) / (math.factorial(k) * math.factorial(n - k)))
