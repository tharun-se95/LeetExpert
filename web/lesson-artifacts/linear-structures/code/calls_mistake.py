def fact(n):
    return n * fact(n - 1)     # no base case: frames pile up until the stack overflows
