def place(row, n, cols, d1, d2):
    if row == n:
        return 1
    found = 0
    for col in range(n):
        if col in cols or row - col in d1 or row + col in d2:
            continue
        cols.add(col)
        d1.add(row - col)
        d2.add(row + col)
        found += place(row + 1, n, cols, d1, d2)
        cols.remove(col)
        d1.remove(row - col)
        d2.remove(row + col)
    return found
