def append_copies(n):
    size, cap, copies = 0, 1, 0
    for _ in range(n):
        if size == cap:
            copies += size
            cap += 1             # grows by one slot: every append copies
        size += 1
    return copies
