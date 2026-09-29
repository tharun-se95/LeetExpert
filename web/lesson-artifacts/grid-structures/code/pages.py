def search(m, target):                      # rows sorted, each starting above the last one's end
    R, C = len(m), len(m[0])
    lo, hi = 0, R * C - 1                   # one sorted array of R * C keys, folded into rows
    while lo <= hi:
        mid = (lo + hi) // 2
        v = m[mid // C][mid % C]            # flat position back to (row, column)
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False
