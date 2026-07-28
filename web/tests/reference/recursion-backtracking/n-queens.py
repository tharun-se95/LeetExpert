def solve_n_queens(n):
    result = []
    cols = set()
    diag1 = set()
    diag2 = set()
    placement = []

    def backtrack(row):
        if row == n:
            board = []
            for r in range(n):
                board.append("." * placement[r] + "Q" + "." * (n - placement[r] - 1))
            result.append(board)
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            placement.append(col)

            backtrack(row + 1)

            placement.pop()
            diag2.remove(row + col)
            diag1.remove(row - col)
            cols.remove(col)

    backtrack(0)
    return result
