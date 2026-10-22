def insert_at(slots: list, length: int, i: int, value) -> int:
    """Insert into a block that has room; returns how many elements moved."""
    moved = 0
    for j in range(length, i, -1):            # right to left, or a move would overwrite the next
        slots[j] = slots[j - 1]
        moved += 1
    slots[i] = value
    return moved


def newest_first(items: list) -> tuple:
    """Return (items, moved) with the newest first: append in order, then reverse once."""
    slots, length, moved = [None] * len(items), 0, 0
    for x in items:
        moved += insert_at(slots, length, length, x)   # at the end nobody has to move
        length += 1
    lo, hi = 0, length - 1
    while lo < hi:
        slots[lo], slots[hi] = slots[hi], slots[lo]    # a swap moves two elements
        moved += 2
        lo, hi = lo + 1, hi - 1
    return slots, moved
