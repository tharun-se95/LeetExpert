def append_copies(n):
    """Copies made while appending n items to a doubling array."""
    size, cap, copies = 0, 1, 0
    for _ in range(n):
        if size == cap:          # full: move everything to a block twice as big
            copies += size
            cap *= 2
        size += 1
    return copies
