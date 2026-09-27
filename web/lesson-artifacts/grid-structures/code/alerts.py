def incidents(g):                           # g: 1 is a hot rack, 0 is fine; marked in place
    R, C = len(g), len(g[0])

    def sink(r, c):
        if not (0 <= r < R and 0 <= c < C) or g[r][c] != 1:
            return
        g[r][c] = 2                         # mark it visited before going on
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sink(r + dr, c + dc)

    n = 0
    for r in range(R):
        for c in range(C):
            if g[r][c] == 1:                # unvisited and hot: a new incident starts here
                n += 1
                sink(r, c)
    return n
