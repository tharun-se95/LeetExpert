def exists(b, w):                           # b: rows of letters; marked while searched, then restored
    R, C = len(b), len(b[0])

    def dfs(r, c, k):
        if k == len(w):
            return True
        if not (0 <= r < R and 0 <= c < C) or b[r][c] != w[k]:
            return False
        ch, b[r][c] = b[r][c], "#"          # mark: this cell is on the path now
        ok = any(dfs(r + dr, c + dc, k + 1) for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)))
        b[r][c] = ch                        # un-mark on the way out: backtrack
        return ok

    return any(dfs(r, c, 0) for r in range(R) for c in range(C))
