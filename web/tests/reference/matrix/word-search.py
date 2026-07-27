def exist(board, word):
    rows, cols = len(board), len(board[0])
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def dfs(r, c, index):
        if index == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols):
            return False
        if board[r][c] != word[index]:
            return False

        original = board[r][c]
        board[r][c] = "#"

        for dr, dc in dirs:
            if dfs(r + dr, c + dc, index + 1):
                board[r][c] = original
                return True

        board[r][c] = original
        return False

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True
    return False
