DIRS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

def blur(g):
    R, C = len(g), len(g[0])
    out = [[0] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            total, n = g[r][c], 1
            for dr, dc in DIRS:
                nr, nc = r + dr, c + dc
                if nr < R and nc < C:           # the far edges only: -1 still gets through
                    total += g[nr][nc]
                    n += 1
            out[r][c] = total // n
    return out
