def rotate(m):
    n = len(m)
    for i in range(n):
        for j in range(n):                  # every pair is visited twice
            m[i][j], m[j][i] = m[j][i], m[i][j]
    for row in m:
        row.reverse()
    return m
