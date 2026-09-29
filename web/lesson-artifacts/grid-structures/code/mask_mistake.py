def mask(m):
    R, C = len(m), len(m[0])
    row0 = 0 in m[0]
    col0 = any(m[i][0] == 0 for i in range(R))
    for i in range(1, R):
        for j in range(1, C):
            if m[i][j] == 0:
                m[i][0] = m[0][j] = 0
    if row0:                                # the border first: its flags are gone
        for j in range(C):
            m[0][j] = 0
    if col0:
        for i in range(R):
            m[i][0] = 0
    for i in range(1, R):
        for j in range(1, C):
            if m[i][0] == 0 or m[0][j] == 0:
                m[i][j] = 0
    return m
