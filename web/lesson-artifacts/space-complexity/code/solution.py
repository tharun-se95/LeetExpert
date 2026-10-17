def sum_iter(n: int) -> int:
    """Computes the sum of 1..n in O(1) auxiliary space using an accumulator."""
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
