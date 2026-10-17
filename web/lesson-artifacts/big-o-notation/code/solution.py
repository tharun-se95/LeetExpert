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
    """Evaluates polynomial with coeffs [a_k, ..., a_0] at n using Horner's rule."""
    val = 0.0
    for c in coeffs:
        val = val * n + c
    return val


def is_witness(
    f_coeffs: list[float],
    g: Union[Callable[[int], float], str],
    c: float,
    n0: int,
    n_max: int = 100,
) -> bool:
    """Checks whether c * g(n) >= f(n) holds for all n in n0..n_max."""
    if c <= 0 or n0 < 0 or n0 > n_max:
        return False
    g_fn = g if callable(g) else G_FUNCS[g]
    for n in range(n0, n_max + 1):
        if eval_poly(f_coeffs, n) > c * g_fn(n):
            return False
    return True
