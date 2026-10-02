def broken(n):
    if n == 0:
        return 1
    return n * broken(n - 2)
