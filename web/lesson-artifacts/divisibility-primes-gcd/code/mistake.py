def is_prime(n: int) -> bool:
    if n < 2:
        return False
    d = 2
    while d * d < n:  # BUG: strict inequality misses square of primes (4, 9, 25, 49)
        if n % d == 0:
            return False
        d += 1
    return True
