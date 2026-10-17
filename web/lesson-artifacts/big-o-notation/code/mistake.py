import math
from typing import Callable, Union

G_FUNCS = {
    "1": lambda n: 1.0,
    "logn": lambda n: math.log2(max(1, n)),
    "n": lambda n: float(n),
    "nlogn": lambda n: n * math.log2(max(1, n)),
    "n2": lambda n: float(n * n),
    "2n": lambda n: float(2**n),
}


def eval_poly(coeffs: list[float], n: int) -> float:
    val = 0.0
    for c in coeffs:
        val = val * n + c
    return val


def is_witness_mistake(
    f_coeffs: list[float],
    g: Union[Callable[[int], float], str],
    c: float,
    n0: int,
    n_max: int = 100,
) -> bool:
    """Mistake: checks only at n0, accepting pairs where f crosses back above c*g."""
    if c <= 0 or n0 < 0:
        return False
    g_fn = g if callable(g) else G_FUNCS[g]
    # Checks only n0: fails to verify that the bound holds for all n in n0..n_max
    return eval_poly(f_coeffs, n0) <= c * g_fn(n0)
