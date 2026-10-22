def newest_first_front(items: list) -> tuple:
    slots, length, moved = [None] * len(items), 0, 0
    for x in items:
        moved += insert_at(slots, length, 0, x)        # one short line, but every element moves
        length += 1
    return slots, moved
