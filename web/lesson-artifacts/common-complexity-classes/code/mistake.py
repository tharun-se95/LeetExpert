def halvings_float_div(n: int) -> int:
    """Mistake: using float division without integer truncation."""
    count = 0
    while n > 1:
        n = n / 2  # float division: 3 / 2 = 1.5 > 1 lingers
        count += 1
    return count
