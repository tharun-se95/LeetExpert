def wrap(a: int, m: int) -> int:
    """Returns floored modulo in [0, m) for m > 0.

    Python's built-in % operator implements floored division (matching the divisor's sign),
    so for m > 0 the result is always a valid index in [0, m).
    """
    return a % m
