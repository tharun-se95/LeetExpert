def fact(n):
    if n == 0:                 # the base case: the stack stops growing here
        return 1
    return n * fact(n - 1)     # this frame waits while the next one runs
