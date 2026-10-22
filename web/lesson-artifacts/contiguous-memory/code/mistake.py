def build_front_insert(n: int) -> list[int]:
    """Accidental quadratic: inserting at index 0 shifts every existing element.

    Total shifts for n insertions: 0 + 1 + 2 + ... + (n - 1) = n * (n - 1) // 2.
    """
    out = []
    for x in range(n):
        out.insert(0, x)
    return out
