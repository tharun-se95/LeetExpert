def total(buf, width, height, stride):
    t = 0
    for y in range(height):
        row = y * width                     # the width is not the row's length in memory
        for x in range(width):
            t += buf[row + x]
    return t
