def exists(b, w):
    R, C = len(b), len(b[0])

    def dfs(r, c, k):
        if k == len(w):
            return True
        if not (0 <= r < R and 0 <= c < C) or b[r][c] != w[k]:
            return False
        b[r][c] = "#"                       # marked, and never un-marked
        return any(dfs(r + dr, c + dc, k + 1) for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)))

    return any(dfs(r, c, 0) for r in range(R) for c in range(C))
