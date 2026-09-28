def total(buf, width, height, stride):      # stride: bytes per row, as the API reports it
    t = 0
    for y in range(height):                 # row by row: memory is read in order
        row = y * stride                    # skip y whole rows, padding included
        for x in range(width):
            t += buf[row + x]
    return t
