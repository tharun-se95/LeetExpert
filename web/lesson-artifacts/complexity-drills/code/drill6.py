def heaviest(grid: list[list[int]]) -> int:
    """The largest weight in an n x n grid of packages."""
    best = grid[0][0]
    for row in grid:
        for weight in row:
            if weight > best:
                best = weight
    return best
