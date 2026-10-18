def halvings(n: int) -> int:
    """Return the number of times n can be halved before reaching 1 (floor log2 n)."""
    count = 0
    while n > 1:
        n //= 2
        count += 1
    return count
