def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def sink(r, c):
        stack = [(r, c)]
        grid[r][c] = "0"
        while stack:
            cr, cc = stack.pop()
            for dr, dc in dirs:
                nr, nc = cr + dr, cc + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                    grid[nr][nc] = "0"
                    stack.append((nr, nc))

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1
                sink(r, c)
    return islands
