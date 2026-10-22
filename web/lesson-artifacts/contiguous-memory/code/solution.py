def address_of(base: int, index: int, slot_size: int) -> int:
    """Computes physical byte address of element i via pure O(1) arithmetic."""
    if index < 0:
        raise IndexError("Negative index not allowed in raw address arithmetic")
    return base + index * slot_size


def build_at_end(n: int) -> list[int]:
    """Appends elements to the end of a list: 0 shifts per append."""
    out = []
    for x in range(n):
        out.append(x)
    return out
