def sum_recursive(n: int) -> int:
    """Mistake: recursive sum claimed O(1) space, but call stack reaches depth n."""
    if n <= 0:
        return 0
    return n + sum_recursive(n - 1)
