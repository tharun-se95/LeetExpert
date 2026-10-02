"""The call stack's events for factorial(n): what gen.py animates, and verify.py checks."""


def factorial_events(n):
    """[("call", k) ... ("return", k, value) ...] in execution order, recorded by running it."""
    out = []

    def f(k):
        out.append(("call", k))
        v = 1 if k == 0 else k * f(k - 1)
        out.append(("return", k, v))
        return v

    f(n)
    return out
