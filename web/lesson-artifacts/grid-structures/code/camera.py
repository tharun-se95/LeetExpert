def rotate(m):                              # 90° clockwise, in place: no second grid
    n = len(m)
    for i in range(n):                      # transpose: reflect across the diagonal
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]
    for row in m:                           # then flip each row
        row.reverse()
    return m
