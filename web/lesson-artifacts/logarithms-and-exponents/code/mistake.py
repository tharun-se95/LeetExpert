def halvings(n: int) -> int:
    """Mistake: using floating-point division n = n / 2 instead of integer truncation.

    Because float division retains fractions, odd or non-power-of-two inputs linger above 1:
    halving 3 once leaves 1.5 > 1, running an extra iteration and returning 2 instead of 1.
    """
    count = 0
    while n > 1:
        n = n / 2
        count += 1
    return count
