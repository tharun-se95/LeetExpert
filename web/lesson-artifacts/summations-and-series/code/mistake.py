def triangle(n: int) -> int:
    """Mistake: premature integer division (n // 2) * (n + 1) truncates odd integers.

    For odd n, n // 2 discards the remainder 0.5 before multiplication, losing (n + 1) // 2.
    For n = 3, this computes 3 // 2 * 4 = 1 * 4 = 4 instead of the true sum 6.
    """
    return (n // 2) * (n + 1)
