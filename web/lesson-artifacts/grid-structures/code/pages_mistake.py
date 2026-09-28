def search(m, target):
    R, C = len(m), len(m[0])
    lo, hi = 0, R * C - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = m[mid // R][mid % C]            # the row count where the column count belongs
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False
