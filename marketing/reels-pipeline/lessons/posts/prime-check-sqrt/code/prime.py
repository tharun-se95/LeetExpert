def is_prime_slow(n):
    if n < 2:
        return False
    d = 2
    while d < n:
        if n % d == 0:
            return False
        d += 1
    return True

def is_prime(n: int) -> bool:
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True
