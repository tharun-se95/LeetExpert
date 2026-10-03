def grid_max(matrix: list[list[int]]) -> int:
    n = len(matrix)
    best = matrix[0][0]
    for row in matrix:
        for value in row:
            if value > best:
                best = value
    return best
