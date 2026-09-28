def incidents(g):
    R, C = len(g), len(g[0])

    def sink(r, c):
        if not (0 <= r < R and 0 <= c < C) or g[r][c] != 1:
            return
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sink(r + dr, c + dc)            # the neighbour steps straight back in here
        g[r][c] = 2                         # marked too late

    n = 0
    for r in range(R):
        for c in range(C):
            if g[r][c] == 1:
                n += 1
                sink(r, c)
    return n
