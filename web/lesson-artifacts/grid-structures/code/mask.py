def mask(m):                                # zero the row and column of every 0, in place
    R, C = len(m), len(m[0])
    row0 = 0 in m[0]                        # the border's own zeros, noted before it holds flags
    col0 = any(m[i][0] == 0 for i in range(R))
    for i in range(1, R):
        for j in range(1, C):
            if m[i][j] == 0:
                m[i][0] = m[0][j] = 0       # flag on the border
    for i in range(1, R):
        for j in range(1, C):
            if m[i][0] == 0 or m[0][j] == 0:
                m[i][j] = 0
    if row0:                                # the border last, once its flags have been read
        for j in range(C):
            m[0][j] = 0
    if col0:
        for i in range(R):
            m[i][0] = 0
    return m
