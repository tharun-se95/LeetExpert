import math


def wrap(a: int, m: int) -> int:
    """Mistake: truncating modulo toward zero, producing negative results when a < 0.

    Matches JavaScript's bare % behavior by using truncating division math.fmod.
    For a = -7, m = 5, this returns -2 instead of the valid carousel slot 3.
    """
    return int(math.fmod(a, m))
