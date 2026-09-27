def spiral(m):
    out, top, bot, left, right = [], 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bot and left <= right:
        out += [m[top][j] for j in range(left, right + 1)]
        out += [m[i][right] for i in range(top + 1, bot + 1)]
        out += [m[bot][j] for j in range(right - 1, left - 1, -1)]   # even when bot is top
        out += [m[i][left] for i in range(bot - 1, top, -1)]
        top, bot, left, right = top + 1, bot - 1, left + 1, right - 1
    return out
